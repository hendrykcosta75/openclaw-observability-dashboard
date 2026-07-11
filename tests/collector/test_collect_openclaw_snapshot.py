from __future__ import annotations

import importlib.util
import json
import sqlite3
import tempfile
from pathlib import Path


COLLECTOR_PATH = Path(__file__).resolve().parents[2] / "scripts" / "collect-openclaw-snapshot.py"


def load_collector():
    spec = importlib.util.spec_from_file_location("collector", COLLECTOR_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _minimal_openclaw_home(tmp_path: Path) -> Path:
    root = tmp_path / "openclaw"
    (root / "agents" / "main" / "agent" / "codex-home").mkdir(parents=True)
    (root / "agents" / "main" / "sessions").mkdir(parents=True)
    (root / "workspace" / "state").mkdir(parents=True)
    (root / "workspace-agendamento-notes" / "state").mkdir(parents=True)
    return root


def _assistant_line(usage: dict[str, int]) -> str:
    """Build a JSONL line matching the OpenClaw session envelope format."""
    return json.dumps({"type": "message", "message": {"role": "assistant", "usage": usage}})


def _user_line(usage: dict[str, int] | None = None) -> str:
    payload: dict[str, Any] = {"type": "message", "message": {"role": "user"}}
    if usage is not None:
        payload["message"]["usage"] = usage
    return json.dumps(payload)


def _tool_line(usage: dict[str, int]) -> str:
    return json.dumps({"type": "message", "message": {"role": "tool", "usage": usage}})


def test_snapshot_is_aggregate_and_has_no_forbidden_values(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)

    (root / "openclaw.json").write_text(
        json.dumps(
            {
                "agents": {
                    "main": {"model": "gpt-5-test"},
                    "agendamento-notes": {"model": "anthropic/claude-sonnet-4-6"},
                },
                "plugins": {
                    "entries": {
                        "slack": {"token": "should-not-appear"},
                        "browser": {"enabled": True},
                    }
                },
                "mcp": {
                    "evolution-whatsapp": {"command": "node"},
                    "notes-gmail": {"command": "node"},
                },
                "apiKey": "forbidden-secret",
            }
        )
    )
    (root / "workspace" / "state" / "agendamento-medico.json").write_text(
        json.dumps(
            {"pending": [{"name": "private person"}], "completed": [{"phone": "555"}]}
        )
    )
    (root / "workspace-agendamento-notes" / "state" / "agendamento-notes.json").write_text(
        json.dumps(
            {
                "proposals": {"a": {"status": "merged", "content": "private"}},
                "errors": [{"message": "private"}],
            }
        )
    )

    snapshot = collector.build_snapshot(root=root, command=lambda _cmd: "")

    assert snapshot["schema"] == "openclaw-observability-snapshot/v1"
    assert snapshot["gateway"]["health"]["status"] == "unavailable"
    assert snapshot["flows"]["medical"]["pending"] == 1
    assert snapshot["flows"]["notes"]["proposal_statuses"] == {"merged": 1}
    assert snapshot["plugins"] == ["browser", "slack"]
    assert snapshot["mcp_servers"] == ["evolution-whatsapp", "notes-gmail"]
    assert snapshot["agents"] == [
        {"name": "agendamento-notes", "model_id": "claude-sonnet-4-6", "tokens_used": 0, "tokens": {"input": 0, "output": 0}, "models": {}, "daily": {}, "daily_models": {}, "sessions_count": 0, "trajectories_count": 0, "events_count": 0, "last_seen": None},
        {"name": "main", "model_id": "gpt-5-test", "tokens_used": 0, "tokens": {"input": 0, "output": 0}, "models": {}, "daily": {}, "daily_models": {}, "sessions_count": 0, "trajectories_count": 0, "events_count": 0, "last_seen": None},
    ]
    serialized = json.dumps(snapshot)
    for forbidden in (
        "should-not-appear",
        "forbidden-secret",
        "private person",
        'private"',
        "api_key",
        "apiKey",
    ):
        assert forbidden not in serialized, forbidden


def test_whatsapp_collection_is_status_only() -> None:
    collector = load_collector()

    def command(args: list[str]) -> str:
        if "psql" in args:
            return json.dumps(
                {
                    "instance_name": "Cleo",
                    "status": "close",
                    "updated_at": "2026-07-10T18:22:30+00:00",
                }
            )
        return ""

    whatsapp = collector.collect_whatsapp(command)
    assert whatsapp == {
        "instance_name": "Cleo",
        "status": "close",
        "updated_at": "2026-07-10T18:22:30+00:00",
    }
    collector.validate_snapshot({"whatsapp": whatsapp})
    serialized = json.dumps(whatsapp).lower()
    for forbidden in ("phone", "jid", "owner", "message", "payload"):
        assert forbidden not in serialized


def test_atomic_write_and_validation_reject_forbidden_keys(tmp_path: Path) -> None:
    collector = load_collector()
    valid = {
        "schema": "openclaw-observability-snapshot/v1",
        "collected_at": "2026-07-10T12:00:00+00:00",
    }
    output = tmp_path / "snapshot.json"

    collector.validate_snapshot(valid)
    collector._write_snapshot_atomic(output, valid)
    assert json.loads(output.read_text()) == valid

    with open(output, "rb") as file:
        import os
        import stat

        assert stat.S_IMODE(os.fstat(file.fileno()).st_mode) == 0o640

    try:
        collector.validate_snapshot({"token": "forbidden"})
    except ValueError:
        pass
    else:
        raise AssertionError("forbidden field must be rejected")

    try:
        collector.validate_snapshot({"long": "x" * 600})
    except ValueError:
        pass
    else:
        raise AssertionError("oversized string must be rejected")


def test_token_aggregates_from_state_sqlite(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    (root / "openclaw.json").write_text(
        json.dumps({"agents": {"main": {"model": "codex/gpt-5.5"}}})
    )
    db_path = root / "agents" / "main" / "agent" / "codex-home" / "state_5.sqlite"
    connection = sqlite3.connect(db_path)
    connection.execute(
        "CREATE TABLE threads (id TEXT PRIMARY KEY, model TEXT, tokens_used INTEGER, updated_at TEXT)"
    )
    connection.execute(
        "INSERT INTO threads VALUES ('t1', 'codex/gpt-5.5', 100, '2026-07-10T10:00:00Z')"
    )
    connection.execute(
        "INSERT INTO threads VALUES ('t2', 'codex/gpt-5.5', 50, '2026-07-10T11:00:00Z')"
    )
    connection.commit()
    connection.close()

    snapshot = collector.build_snapshot(root=root, command=lambda _cmd: "")
    agent = next((agent for agent in snapshot["agents"] if agent["name"] == "main"), None)
    assert agent is not None
    assert agent["model_id"] == "codex/gpt-5.5"
    assert agent["tokens_used"] == 150
    assert agent["last_seen"] is not None
    assert snapshot["tokens"]["total"] == 150


def test_daily_token_deltas(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    (root / "openclaw.json").write_text(json.dumps({"agents": {"main": {"model": "m"}}}))
    output = tmp_path / "snapshot.json"

    snapshot = collector.build_snapshot(
        root=root, command=lambda _cmd: "", output=output
    )
    assert snapshot["tokens"]["total"] == 0
    ledger_path = output.with_name("openclaw-token-ledger.json")
    assert ledger_path.exists()
    ledger = json.loads(ledger_path.read_text())
    assert ledger["totals"] == {"main": 0}
    assert list(ledger["daily"])[-1] == snapshot["collected_at"][:10]

    # SQLite-only usage is counted when no JSONL session data is present.
    db_path = root / "agents" / "main" / "agent" / "codex-home" / "state_5.sqlite"
    connection = sqlite3.connect(db_path)
    connection.execute(
        "CREATE TABLE threads (id TEXT PRIMARY KEY, model TEXT, tokens_used INTEGER, updated_at TEXT)"
    )
    connection.execute(
        "INSERT INTO threads VALUES ('t1', 'm', 200, '2026-07-10T12:00:00Z')"
    )
    connection.commit()
    connection.close()

    snapshot2 = collector.build_snapshot(
        root=root, command=lambda _cmd: "", output=output
    )
    assert snapshot2["tokens"]["total"] == 200
    assert snapshot2["tokens"]["by_agent"] == [
        {"name": "main", "model_id": "m", "models": {}, "tokens_used": 200, "tokens": {"input": 200, "output": 0}}
    ]

    # When JSONL session data is present, it is authoritative and replaces SQLite
    # totals to avoid double-counting the same sessions.
    session_dir = root / "agents" / "main" / "sessions"
    (session_dir / "session.jsonl").write_text(
        "\n".join(
            [
                _user_line({"input": 999, "output": 999}),
                _assistant_line({"input": 80, "output": 20}),
                _assistant_line({"input": 40, "output": 10}),
            ]
        )
    )

    snapshot3 = collector.build_snapshot(
        root=root, command=lambda _cmd: "", output=output
    )
    assert snapshot3["tokens"]["total"] == 150
    assert snapshot3["tokens"]["by_agent"] == [
        {"name": "main", "model_id": "m", "models": {}, "tokens_used": 150, "tokens": {"input": 120, "output": 30}}
    ]
    # The daily ledger point is delta-based and does not shrink when the source
    # switches from SQLite to JSONL (negative deltas are clamped to zero).
    assert snapshot3["tokens"]["daily"][-1]["tokens_used"] >= 150
    assert snapshot3["tokens"]["daily"][-1]["tokens"]["input"] >= 120
    assert snapshot3["tokens"]["daily"][-1]["tokens"]["output"] >= 30
    ledger3 = json.loads(ledger_path.read_text())
    assert ledger3["tokens"]["totals"]["main"] == {"input": 120, "output": 30}

    # Re-running with unchanged mtime should not duplicate totals.
    snapshot4 = collector.build_snapshot(
        root=root, command=lambda _cmd: "", output=output
    )
    assert snapshot4["tokens"]["total"] == 150

    # A modified session file should be reprocessed and only the delta counted
    # toward today's daily point (since previous totals already include the file).
    (session_dir / "session.jsonl").write_text(
        "\n".join(
            [
                _assistant_line({"input": 80, "output": 20}),
                _assistant_line({"input": 40, "output": 10}),
                _assistant_line({"input": 50, "output": 50}),
            ]
        )
    )
    snapshot5 = collector.build_snapshot(
        root=root, command=lambda _cmd: "", output=output
    )
    # 80+20+40+10+50+50 = 250
    assert snapshot5["tokens"]["total"] == 250

    # A fresh ledger without SQLite history should record the exact daily value.
    ledger_path.unlink()
    snapshot6 = collector.build_snapshot(
        root=root, command=lambda _cmd: "", output=output
    )
    assert snapshot6["tokens"]["total"] == 250
    assert snapshot6["tokens"]["daily"][-1]["tokens_used"] == 250
    assert snapshot6["tokens"]["daily"][-1]["tokens"] == {"input": 170, "output": 80}


def test_daily_token_deltas_jsonl_replaces_sqlite_to_avoid_double_counting(
    tmp_path: Path,
) -> None:
    """JSONL data is authoritative over SQLite totals to avoid double counting."""
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    (root / "openclaw.json").write_text(json.dumps({"agents": {"main": {"model": "m"}}}))
    output = tmp_path / "snapshot.json"

    db_path = root / "agents" / "main" / "agent" / "codex-home" / "state_5.sqlite"
    connection = sqlite3.connect(db_path)
    connection.execute(
        "CREATE TABLE threads (id TEXT PRIMARY KEY, model TEXT, tokens_used INTEGER, updated_at TEXT)"
    )
    connection.execute(
        "INSERT INTO threads VALUES ('t1', 'm', 200, '2026-07-10T12:00:00Z')"
    )
    connection.commit()
    connection.close()

    session_dir = root / "agents" / "main" / "sessions"
    (session_dir / "session.jsonl").write_text(
        "\n".join(
            [
                _assistant_line({"input": 80, "output": 20}),
                _assistant_line({"input": 40, "output": 10}),
            ]
        )
    )

    snapshot = collector.build_snapshot(
        root=root, command=lambda _cmd: "", output=output
    )
    assert snapshot["tokens"]["total"] == 150
    assert snapshot["tokens"]["by_agent"] == [
        {"name": "main", "model_id": "m", "models": {}, "tokens_used": 150, "tokens": {"input": 120, "output": 30}}
    ]


def test_jsonl_usage_only_counts_assistant_usage(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    (root / "openclaw.json").write_text(json.dumps({"agents": {"main": {"model": "m"}}}))
    output = tmp_path / "snapshot.json"
    session_dir = root / "agents" / "main" / "sessions"
    (session_dir / "session.jsonl").write_text(
        "\n".join(
            [
                _user_line({"input": 999, "output": 999}),
                json.dumps(
                    {"type": "message", "message": {"role": "assistant", "content": "sensitive", "usage": {"input": 100, "output": 25}}}
                ),
                _assistant_line({"input": 50, "output": 15}),
                _tool_line({"input": 888, "output": 888}),
            ]
        )
    )

    snapshot = collector.build_snapshot(root=root, command=lambda _cmd: "", output=output)
    agent = next((agent for agent in snapshot["agents"] if agent["name"] == "main"), None)
    assert agent is not None
    assert agent["tokens"] == {"input": 150, "output": 40}
    assert agent["tokens_used"] == 190
    assert snapshot["tokens"]["total"] == 190

    # The snapshot validator should reject raw message content, so make sure it
    # is not present in the output (content is intentionally ignored above).
    serialized = json.dumps(snapshot)
    assert "sensitive" not in serialized


def test_jsonl_preserves_model_and_calendar_day_dimensions(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    (root / "openclaw.json").write_text(json.dumps({"agents": {"main": {"model": "gpt-5.4"}}}))
    output = tmp_path / "snapshot.json"
    session = root / "agents" / "main" / "sessions" / "session.jsonl"
    session.write_text(
        "\n".join(
            [
                json.dumps({"timestamp": "2026-07-10T23:00:00Z", "message": {"role": "assistant", "model": "gpt-5.4", "usage": {"input": 100, "output": 20}}}),
                json.dumps({"timestamp": "2026-07-11T01:00:00Z", "message": {"role": "assistant", "model": "openai/gpt-5.5", "usage": {"input": 50, "output": 10}}}),
            ]
        )
    )

    snapshot = collector.build_snapshot(root=root, command=lambda _cmd: "", output=output)
    agent = snapshot["agents"][0]
    assert agent["model_id"] == "gpt-5.4"
    assert agent["models"] == {
        "gpt-5.4": {"input": 100, "output": 20},
        "gpt-5.5": {"input": 50, "output": 10},
    }
    ledger = json.loads(output.with_name("openclaw-token-ledger.json").read_text())
    assert ledger["tokens"]["daily"]["2026-07-10"]["main"] == {"input": 100, "output": 20}
    assert ledger["tokens"]["daily"]["2026-07-11"]["main"] == {"input": 50, "output": 10}
    assert ledger["tokens"]["daily_models"]["2026-07-11"]["main"]["gpt-5.5"] == {"input": 50, "output": 10}


def test_session_trajectory_and_event_counts_are_collected(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    (root / "openclaw.json").write_text(json.dumps({"agents": {"main": {"model": "gpt-5.4"}}}))
    session_dir = root / "agents" / "main" / "sessions"
    (session_dir / "session.jsonl").write_text(
        "\n".join([_user_line(), _assistant_line({"input": 10, "output": 2})])
    )
    (session_dir / "session.trajectory.jsonl").write_text(
        _assistant_line({"input": 4, "output": 1})
    )

    snapshot = collector.build_snapshot(root=root, command=lambda _cmd: "")
    agent = snapshot["agents"][0]
    assert agent["sessions_count"] == 1
    assert agent["trajectories_count"] == 1
    assert agent["events_count"] == 3


def test_log_counters_are_aggregated_and_incremental(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    log_path = root / "workspace" / "logs" / "agendamento-medico-automation.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.write_text(
        "2026-07-11 completed\n2026-07-11 ERROR failed\n2026-07-11 pending\n"
    )
    state_path = tmp_path / "state.json"

    first = collector.collect_log_sources(root, state_path=state_path)
    assert first[0]["line_count"] == 3
    assert first[0]["error_count"] == 1
    assert first[0]["deferred_count"] == 1
    assert first[0]["success_count"] == 1
    assert first[0]["recent_7d"]["errors"] == 1

    with log_path.open("a") as handle:
        handle.write("2026-07-11 success\n")
    second = collector.collect_log_sources(root, state_path=state_path)
    assert second[0]["line_count"] == 4
    assert second[0]["success_count"] == 2


def test_forbidden_values_rejected(tmp_path: Path) -> None:
    collector = load_collector()
    for bad in (
        "1234567890",
        "5511987654321",
        "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        "user@example.com",
    ):
        try:
            collector.validate_snapshot({"safe": bad})
        except ValueError:
            pass
        else:
            raise AssertionError(f"suspicious value must be rejected: {bad}")


def test_smoke(tmp_path: Path) -> None:
    collector = load_collector()
    root = _minimal_openclaw_home(tmp_path)
    (root / "openclaw.json").write_text(json.dumps({"agents": {"main": {"model": "m"}}}))
    output = tmp_path / "snapshot.json"

    # Exercise the public build_snapshot -> validate -> write flow directly.
    snapshot = collector.build_snapshot(root=root, output=output, command=lambda _cmd: "")
    collector.validate_snapshot(snapshot)
    collector._write_snapshot_atomic(output, snapshot)
    written = json.loads(output.read_text())
    assert written["schema"] == collector.SCHEMA
    assert written["availability"]["collector"] == "available"


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as directory:
        test_snapshot_is_aggregate_and_has_no_forbidden_values(Path(directory))
    with tempfile.TemporaryDirectory() as directory:
        test_atomic_write_and_validation_reject_forbidden_keys(Path(directory))
    with tempfile.TemporaryDirectory() as directory:
        test_token_aggregates_from_state_sqlite(Path(directory))
    with tempfile.TemporaryDirectory() as directory:
        test_daily_token_deltas(Path(directory))
    with tempfile.TemporaryDirectory() as directory:
        test_jsonl_usage_only_counts_assistant_usage(Path(directory))
    with tempfile.TemporaryDirectory() as directory:
        test_forbidden_values_rejected(Path(directory))
    with tempfile.TemporaryDirectory() as directory:
        test_smoke(Path(directory))
    print("collector-contract=pass")
