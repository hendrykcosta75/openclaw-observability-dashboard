#!/usr/bin/env python3
"""Collect a sanitized, aggregate-only OpenClaw observability snapshot.

The collector never emits configuration values, raw logs, payloads, session IDs,
or message/state content. It is intended to run as the dashboard user via a
systemd timer; web requests only read the resulting JSON file.
"""

from __future__ import annotations

import argparse
import collections
import json
import os
import re
import sqlite3
import subprocess
import tempfile
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable, TypedDict


class TokenSpend(TypedDict):
    input: int
    output: int


SCHEMA = "openclaw-observability-snapshot/v1"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OPENCLAW_ROOT = Path(os.environ.get("OPENCLAW_HOME", "/home/ubuntu/.openclaw"))
DEFAULT_OUTPUT = Path(
    os.environ.get("OPENCLAW_SNAPSHOT_PATH", PROJECT_ROOT / "data" / "openclaw-snapshot.json")
)
DEFAULT_TOKEN_STATE_PATH = Path(
    os.environ.get(
        "OPENCLAW_TOKEN_STATE_PATH",
        str(PROJECT_ROOT / "data" / "openclaw-token-state.json"),
    )
)
# Forbidden keys that could carry credentials, PII, payloads, or operational secrets.
FORBIDDEN_KEY = re.compile(
    r"(?:^|\.)(?:password|secret|api[_-]?key|credential|cookie|authorization|access[_-]?token|refresh[_-]?token|webhook|"
    r"message|content|preview|title|phone|email|cpf|jid|raw|payload|trajectory|session_id|thread_id|private_url|token|"
    r"note|body|subject|sender|recipient|from|to|text|conversation|document|card|carteirinha|"
    r"patient|clinic|paciente|consultorio|medico|doctor)(?:$|\.|_)",
    re.IGNORECASE,
)

Command = Callable[[list[str]], str]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def run_command(command: list[str]) -> str:
    completed = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        timeout=10,
        check=False,
    )
    return completed.stdout if completed.returncode == 0 else ""


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def parse_systemd_show(raw: str) -> dict[str, Any]:
    values = dict(line.split("=", 1) for line in raw.splitlines() if "=" in line)

    def as_int(name: str) -> int | None:
        try:
            return int(values[name])
        except (KeyError, TypeError, ValueError):
            return None

    return {
        "state": values.get("ActiveState", "unavailable"),
        "substate": values.get("SubState", "unknown"),
        "pid": as_int("MainPID"),
        "memory_current_bytes": as_int("MemoryCurrent"),
        "memory_max_bytes": as_int("MemoryMax"),
        "tasks_current": as_int("TasksCurrent"),
        "tasks_max": as_int("TasksMax"),
        "restarts": as_int("NRestarts"),
        "started_at": values.get("ExecMainStartTimestamp") or None,
    }


def gateway_health(command: Command) -> dict[str, Any]:
    started = time.perf_counter()
    raw = command(
        ["curl", "--max-time", "3", "-fsS", "http://127.0.0.1:18789/health"]
    )
    latency_ms = round((time.perf_counter() - started) * 1000)
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        payload = {}
    return {
        "status": "live" if payload.get("ok") else "unavailable",
        "latency_ms": latency_ms if payload.get("ok") else None,
    }


def collect_services(command: Command) -> list[dict[str, str]]:
    raw = command(
        ["docker", "ps", "--format", "{{.Names}}\t{{.Image}}\t{{.Status}}"]
    )
    rows: list[dict[str, str]] = []
    for line in raw.splitlines():
        parts = line.split("\t", 2)
        if len(parts) == 3:
            rows.append(
                {"name": parts[0][:120], "image": parts[1][:120], "state": parts[2][:120]}
            )
    return rows


def collect_whatsapp(command: Command) -> dict[str, Any]:
    """Read only the latest Evolution instance name and connection state."""
    sql = (
        'SELECT json_build_object('
        "'instance_name', name, "
        "'status', COALESCE(\"connectionStatus\"::text, 'unknown'), "
        "'updated_at', \"updatedAt\""
        ')::text FROM public."Instance" '
        'ORDER BY "updatedAt" DESC LIMIT 1;'
    )
    raw = command(
        [
            "docker", "exec", "evolution-postgres", "psql",
            "-U", "postgres", "-d", "evolution", "-At", "-c", sql,
        ]
    ).strip()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        payload = {}

    status = str(payload.get("status") or "unavailable").lower()[:32]
    instance_name = re.sub(
        r"[^A-Za-z0-9_. -]", "", str(payload.get("instance_name") or "unavailable")
    )[:80]
    updated_at = payload.get("updated_at")
    return {
        "instance_name": instance_name or "unavailable",
        "status": status,
        "updated_at": str(updated_at)[:64] if updated_at else None,
    }


def collect_ports(command: Command) -> list[dict[str, str]]:
    raw = command(["ss", "-lntpH"])
    ports: list[dict[str, str]] = []
    for line in raw.splitlines():
        fields = line.split()
        if len(fields) < 4:
            continue
        address = fields[3]
        match = re.search(r"(?:\[?([0-9a-fA-F:.]+)\]?|\*)(?::(\d+))$", address)
        if not match:
            continue
        bind, port = match.group(1), match.group(2)
        bind = bind or "*"
        process_match = re.search(r'\(\("?([^",]+)', line)
        process = process_match.group(1) if process_match else "unknown"
        ports.append(
            {
                "port": port,
                "bind": bind,
                "process": process[:80],
                "exposure": "loopback" if bind in {"127.0.0.1", "::1"} else "network",
            }
        )
    return sorted(ports, key=lambda item: (int(item["port"]), item["bind"]))


def _parse_systemd_timer_lines(raw: str) -> list[dict[str, str]]:
    timers: list[dict[str, str]] = []
    for line in raw.splitlines():
        fields = line.split()
        timer = next((field for field in fields if field.endswith(".timer")), "")
        service = next((field for field in fields if field.endswith(".service")), "")
        if timer:
            timers.append({"name": timer, "service": service or "unknown"})
    return sorted(timers, key=lambda item: item["name"])


def _parse_systemd_unit_properties(raw: str) -> dict[str, str]:
    return dict(line.split("=", 1) for line in raw.splitlines() if "=" in line)


def collect_timers(command: Command) -> list[dict[str, Any]]:
    raw = command(
        ["systemctl", "--user", "list-timers", "--all", "--no-pager", "--no-legend"]
    )
    timers = _parse_systemd_timer_lines(raw)
    enriched: list[dict[str, Any]] = []
    for timer in timers:
        show = command(
            [
                "systemctl",
                "--user",
                "show",
                timer["name"],
                "--property=ActiveState,Result,LastTriggerUSecRealtime,NextElapseUSecRealtime,Unit",
            ]
        )
        props = _parse_systemd_unit_properties(show)
        last_trigger = props.get("LastTriggerUSecRealtime") or ""
        next_due = props.get("NextElapseUSecRealtime") or ""
        unit = props.get("Unit") or ""
        enriched.append(
            {
                "name": timer["name"],
                "service": unit or timer["service"],
                "state": props.get("ActiveState", "unknown"),
                "result": props.get("Result", "unknown"),
                "last_trigger_at": _format_systemd_usec(last_trigger) or None,
                "next_due_at": _format_systemd_usec(next_due) or None,
            }
        )
    return enriched


def _format_systemd_usec(value: str) -> str | None:
    if not value or value in {"0", "n/a"}:
        return None
    try:
        usec = int(value)
        dt = datetime.fromtimestamp(usec / 1_000_000, tz=timezone.utc)
        return dt.isoformat(timespec="seconds")
    except (ValueError, OverflowError, OSError):
        return None


def _cron_category(line: str) -> str:
    lowered = line.lower()
    if "notes" in lowered:
        return "notes"
    if any(word in lowered for word in ("medico", "medical", "approval")):
        return "medical"
    if "marketing" in lowered:
        return "marketing"
    if "health" in lowered or "watchdog" in lowered or "reaper" in lowered:
        return "platform"
    if "browser" in lowered or "gateway" in lowered or "openclaw" in lowered:
        return "platform"
    return "other"


def collect_crons(command: Command) -> list[dict[str, Any]]:
    raw = command(["crontab", "-l"])
    buckets: collections.Counter[str] = collections.Counter()
    for line in raw.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith(("SHELL=", "PATH=")):
            continue
        buckets[_cron_category(stripped)] += 1
    return [{"category": key, "jobs": value} for key, value in sorted(buckets.items())]


def state_status_counts(value: Any) -> dict[str, int]:
    counter: collections.Counter[str] = collections.Counter()
    iterable = (
        value.values()
        if isinstance(value, dict)
        else value
        if isinstance(value, list)
        else []
    )
    for item in iterable:
        if isinstance(item, dict):
            status = str(item.get("status") or "unknown").strip().lower()[:64]
            counter[status] += 1
    return dict(sorted(counter.items()))


def _mtime_iso(path: Path) -> str | None:
    try:
        return datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(
            timespec="seconds"
        )
    except (OSError, ValueError):
        return None


def collect_flows(root: Path) -> dict[str, Any]:
    medical = read_json(root / "workspace" / "state" / "agendamento-medico.json")
    notes = read_json(
        root / "workspace-agendamento-notes" / "state" / "agendamento-notes.json"
    )
    medical_path = root / "workspace" / "state" / "agendamento-medico.json"
    notes_path = root / "workspace-agendamento-notes" / "state" / "agendamento-notes.json"
    medical_approvals = medical.get("contact_approvals")
    return {
        "medical": {
            "pending": len(medical.get("pending") or []),
            "completed": len(medical.get("completed") or []),
            "approval_statuses": state_status_counts(medical_approvals),
            "updated_at": _mtime_iso(medical_path),
        },
        "notes": {
            "proposal_statuses": state_status_counts(notes.get("proposals")),
            "errors": len(notes.get("errors") or []),
            "updated_at": _mtime_iso(notes_path),
        },
    }


def _model_id(value: Any) -> str:
    """Normalize a model identifier to the short form used in pricing.

    OpenClaw configs may use vendor-prefixed ids such as codex/gpt-5.4 or
    anthropic/claude-sonnet-4-6. The pricing table stores short ids like
    gpt-5.4 and claude-sonnet-4-6, so we strip common vendor prefixes here.
    """
    if isinstance(value, dict):
        value = value.get("primary") or value.get("fallback") or "unavailable"
    if value is None:
        return "unavailable"
    model_id = str(value).strip()
    for prefix in ("codex/", "openai/", "anthropic/"):
        if model_id.startswith(prefix):
            model_id = model_id[len(prefix):]
    return model_id[:160] if model_id else "unavailable"


def _extract_allowlist(config: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Return only safe, non-secret identifiers from openclaw.json.

    Allowed items: plugin names, MCP server names, agent IDs/names, and model IDs.
    Everything else is intentionally dropped.
    """
    result: dict[str, dict[str, Any]] = {}
    agents = config.get("agents")
    if isinstance(agents, dict):
        result["agents"] = {
            str(name): {"model_id": _model_id(definition.get("model"))}
            for name, definition in agents.items()
            if isinstance(definition, dict)
        }
        # Some configs keep the agent list under agents.list instead of top-level.
        agent_list = agents.get("list")
        if isinstance(agent_list, list):
            for item in agent_list:
                if isinstance(item, dict) and item.get("id"):
                    result["agents"][str(item["id"])[:100]] = {
                        "model_id": _model_id(item.get("model"))
                    }
    elif isinstance(agents, list):
        result["agents"] = {
            str(item.get("name"))[:100]: {"model_id": _model_id(item.get("model"))}
            for item in agents
            if isinstance(item, dict) and item.get("name")
        }

    plugins = config.get("plugins")
    if isinstance(plugins, dict):
        entries = plugins.get("entries") if isinstance(plugins.get("entries"), dict) else plugins
        if isinstance(entries, dict):
            result["plugins"] = {str(name): {} for name in entries if isinstance(entries[name], dict)}
    if isinstance(plugins, list):
        result["plugins"] = {str(name): {} for name in plugins if isinstance(name, str)}

    mcp_servers = config.get("mcp") or config.get("mcpServers") or config.get("mcp_servers")
    if isinstance(mcp_servers, dict):
        entries = mcp_servers.get("servers") if isinstance(mcp_servers.get("servers"), dict) else mcp_servers
        if isinstance(entries, dict):
            result["mcp_servers"] = {str(name): {} for name in entries}
    elif isinstance(mcp_servers, list):
        result["mcp_servers"] = {str(name): {} for name in mcp_servers if isinstance(name, str)}
    return result


def configured_allowlist(root: Path) -> dict[str, dict[str, Any]]:
    return _extract_allowlist(read_json(root / "openclaw.json"))


def _sqlite_agents(root: Path) -> dict[str, dict[str, Any]]:
    """Read tokens per agent from read-only state_5.sqlite files.

    Groups threads.tokens_used by agent directory name and model.
    """
    records: dict[str, dict[str, Any]] = {}
    agents_dir = root / "agents"
    if not agents_dir.exists():
        return records
    for sqlite_path in agents_dir.rglob("state_5.sqlite"):
        try:
            rel = sqlite_path.relative_to(agents_dir)
            agent = rel.parts[0] if rel.parts else "unknown"
            connection = sqlite3.connect(f"file:{sqlite_path}?mode=ro", uri=True)
            try:
                cursor = connection.execute(
                    "SELECT model, COALESCE(SUM(tokens_used), 0) FROM threads GROUP BY model"
                )
                rows = cursor.fetchall()
            finally:
                connection.close()
        except (sqlite3.Error, OSError, ValueError):
            continue
        if agent not in records:
            records[agent] = {
                "tokens_used": 0,
                "tokens": TokenSpend(input=0, output=0),
                "models": collections.Counter[str](),
                "last_seen": None,
            }
        for model, tokens in rows:
            tokens = int(tokens or 0)
            records[agent]["tokens_used"] += tokens
            records[agent]["tokens"]["input"] += tokens
            records[agent]["models"][str(model or "unavailable")[:160]] += tokens
        try:
            mtime = datetime.fromtimestamp(sqlite_path.stat().st_mtime, tz=timezone.utc)
            if records[agent]["last_seen"] is None or mtime.isoformat() > records[agent]["last_seen"]:
                records[agent]["last_seen"] = mtime.isoformat(timespec="seconds")
        except (OSError, ValueError):
            pass
    return records


def _list_jsonl_session_files(root: Path) -> list[Path]:
    agents_dir = root / "agents"
    if not agents_dir.exists():
        return []
    files: list[Path] = []
    for agent_dir in agents_dir.iterdir():
        if not agent_dir.is_dir():
            continue
        sessions_dir = agent_dir / "sessions"
        if not sessions_dir.is_dir():
            continue
        for path in sessions_dir.glob("*.jsonl"):
            if path.is_file():
                files.append(path)
    return sorted(files)


def collect_session_inventory(root: Path) -> dict[str, dict[str, int]]:
    """Count real session and trajectory files without exposing their IDs/content."""
    inventory: dict[str, dict[str, int]] = {}
    for path in _list_jsonl_session_files(root):
        try:
            relative = path.relative_to(root / "agents")
            agent = relative.parts[0]
        except (ValueError, IndexError):
            continue
        record = inventory.setdefault(agent, {"sessions": 0, "trajectories": 0})
        if path.name.endswith(".trajectory.jsonl"):
            record["trajectories"] += 1
        else:
            record["sessions"] += 1
    return inventory


def _usage_date(payload: dict[str, Any], message: dict[str, Any]) -> str | None:
    value = payload.get("timestamp") or message.get("timestamp")
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).date().isoformat()
        except ValueError:
            return None
    if isinstance(value, (int, float)):
        try:
            seconds = value / 1000 if value > 10_000_000_000 else value
            return datetime.fromtimestamp(seconds, tz=timezone.utc).date().isoformat()
        except (OverflowError, OSError, ValueError):
            return None
    return None


def _extract_jsonl_usage(path: Path) -> dict[str, Any]:
    """Collect assistant token usage with model and UTC-day dimensions."""
    total: TokenSpend = TokenSpend(input=0, output=0)
    models: collections.Counter[str] = collections.Counter()
    model_usage: dict[str, TokenSpend] = {}
    daily: dict[str, TokenSpend] = {}
    daily_models: dict[str, dict[str, TokenSpend]] = {}
    events_count = 0
    try:
        with open(path, "r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if not line:
                    continue
                try:
                    payload = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not isinstance(payload, dict):
                    continue
                events_count += 1
                message = payload.get("message")
                if not isinstance(message, dict) or message.get("role") != "assistant":
                    continue
                usage = message.get("usage")
                if not isinstance(usage, dict):
                    continue
                try:
                    inp = max(0, int(usage.get("input") or 0))
                    out = max(0, int(usage.get("output") or 0))
                except (TypeError, ValueError):
                    continue
                total["input"] += inp
                total["output"] += out
                model = _model_id(message.get("model") or payload.get("model"))
                if model and model != "unavailable":
                    models[model] += inp + out
                    model_usage.setdefault(model, TokenSpend(input=0, output=0))
                    model_usage[model]["input"] += inp
                    model_usage[model]["output"] += out
                day = _usage_date(payload, message)
                if day is not None:
                    daily.setdefault(day, TokenSpend(input=0, output=0))
                    daily[day]["input"] += inp
                    daily[day]["output"] += out
                    daily_models.setdefault(day, {})
                    if model and model != "unavailable":
                        daily_models[day].setdefault(model, TokenSpend(input=0, output=0))
                        daily_models[day][model]["input"] += inp
                        daily_models[day][model]["output"] += out
    except (OSError, ValueError):
        pass
    return {
        "input": total["input"],
        "output": total["output"],
        "models": dict(models),
        "model_usage": model_usage,
        "daily": daily,
        "daily_models": daily_models,
        "events_count": events_count,
    }

def _load_token_state(state_path: Path) -> dict[str, Any]:
    value = read_json(state_path)
    if isinstance(value, dict) and isinstance(value.get("files"), dict):
        return value
    return {"files": {}}


def _collect_jsonl_usage(
    root: Path,
    state_path: Path | None,
) -> dict[str, dict[str, Any]]:
    """Incrementally collect input/output tokens from session JSONL files.

    A persistent state file stores the last processed mtime per session file so
    only modified files are re-read. The returned records map agent name to
    tokens and per-model totals.
    """
    state_file = state_path or DEFAULT_TOKEN_STATE_PATH
    state = _load_token_state(state_file)
    file_states: dict[str, Any] = state.get("files") if isinstance(state.get("files"), dict) else {}
    records: dict[str, dict[str, Any]] = {}

    for path in _list_jsonl_session_files(root):
        try:
            mtime = path.stat().st_mtime
        except (OSError, ValueError):
            continue
        key = str(path)
        previous = file_states.get(key)
        if isinstance(previous, dict):
            previous_mtime = previous.get("mtime")
            cached_models = previous.get("models")
            cached_model_usage = previous.get("model_usage")
            cached_daily = previous.get("daily")
            cached_daily_models = previous.get("daily_models")
            cached_events_count = previous.get("events_count")
            # Re-read if the file changed or if the cached entry predates the
            # model/day/event dimensions.
            if (
                isinstance(previous_mtime, (int, float))
                and mtime <= previous_mtime
                and isinstance(cached_models, dict)
                and isinstance(cached_model_usage, dict)
                and isinstance(cached_daily, dict)
                and isinstance(cached_daily_models, dict)
                and isinstance(cached_events_count, int)
            ):
                spend = {
                    "input": int(previous.get("input", 0)),
                    "output": int(previous.get("output", 0)),
                    "models": cached_models,
                    "model_usage": cached_model_usage,
                    "daily": cached_daily,
                    "daily_models": cached_daily_models,
                    "events_count": cached_events_count,
                }
            else:
                spend = _extract_jsonl_usage(path)
        else:
            spend = _extract_jsonl_usage(path)
        file_states[key] = {
            "mtime": mtime,
            "input": spend["input"],
            "output": spend["output"],
            "models": dict(spend.get("models") or {}),
            "model_usage": spend.get("model_usage") or {},
            "daily": spend.get("daily") or {},
            "daily_models": spend.get("daily_models") or {},
            "events_count": int(spend.get("events_count") or 0),
        }

        try:
            rel = path.relative_to(root / "agents")
            agent = rel.parts[0] if rel.parts else "unknown"
        except (ValueError, IndexError):
            agent = "unknown"
        if agent not in records:
            records[agent] = {
                "tokens_used": 0,
                "tokens": TokenSpend(input=0, output=0),
                "models": collections.Counter[str](),
                "model_usage": {},
                "daily": {},
                "daily_models": {},
                "events_count": 0,
                "last_seen": None,
            }
        records[agent]["events_count"] += int(spend.get("events_count") or 0)
        records[agent]["tokens"]["input"] += spend["input"]
        records[agent]["tokens"]["output"] += spend["output"]
        records[agent]["tokens_used"] += spend["input"] + spend["output"]
        file_models = spend.get("models") or {}
        records[agent]["models"].update(file_models)
        for model, model_spend in (spend.get("model_usage") or {}).items():
            current = records[agent]["model_usage"].setdefault(model, {"input": 0, "output": 0})
            current["input"] += int(model_spend.get("input", 0))
            current["output"] += int(model_spend.get("output", 0))
        for day, day_spend in (spend.get("daily") or {}).items():
            current = records[agent]["daily"].setdefault(day, {"input": 0, "output": 0})
            current["input"] += int(day_spend.get("input", 0))
            current["output"] += int(day_spend.get("output", 0))
        for day, models_for_day in (spend.get("daily_models") or {}).items():
            day_record = records[agent]["daily_models"].setdefault(day, {})
            for model, model_spend in models_for_day.items():
                current = day_record.setdefault(model, {"input": 0, "output": 0})
                current["input"] += int(model_spend.get("input", 0))
                current["output"] += int(model_spend.get("output", 0))
        try:
            mtime_dt = datetime.fromtimestamp(mtime, tz=timezone.utc)
            if records[agent]["last_seen"] is None or mtime_dt.isoformat() > records[agent]["last_seen"]:
                records[agent]["last_seen"] = mtime_dt.isoformat(timespec="seconds")
        except (OSError, ValueError):
            pass

    try:
        state_file.parent.mkdir(parents=True, exist_ok=True)
        encoded = json.dumps({"files": file_states}, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=state_file.parent, prefix=f".{state_file.name}.", delete=False
        ) as temporary:
            temporary.write(encoded)
            temporary.flush()
            os.fsync(temporary.fileno())
            temporary_name = temporary.name
        os.chmod(temporary_name, 0o640)
        os.replace(temporary_name, state_file)
    except (OSError, ValueError):
        pass

    return records


def _merge_agent_records(
    sqlite_records: dict[str, dict[str, Any]],
    jsonl_records: dict[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    """Merge SQLite and JSONL token records without double-counting.

    JSONL session files provide the authoritative input/output split. SQLite
    state files only expose tokens_used without the split, so they are used as
    a fallback when JSONL data is missing for an agent.
    """
    merged: dict[str, dict[str, Any]] = {}
    for name in sorted(set(sqlite_records) | set(jsonl_records)):
        sqlite = sqlite_records.get(name, {})
        jsonl = jsonl_records.get(name, {})
        jsonl_input = int(jsonl.get("tokens", {}).get("input", 0) if isinstance(jsonl.get("tokens"), dict) else 0)
        jsonl_output = int(jsonl.get("tokens", {}).get("output", 0) if isinstance(jsonl.get("tokens"), dict) else 0)
        jsonl_total = jsonl_input + jsonl_output

        if jsonl_total > 0:
            # Prefer JSONL because it has the input/output split we need for cost.
            tokens_used = jsonl_total
            tokens = TokenSpend(input=jsonl_input, output=jsonl_output)
            models = collections.Counter[str](jsonl.get("models") or {})
            model_usage = jsonl.get("model_usage") or {}
            daily = jsonl.get("daily") or {}
            daily_models = jsonl.get("daily_models") or {}
            events_count = int(jsonl.get("events_count") or 0)
        else:
            sqlite_input = int(sqlite.get("tokens", {}).get("input", 0) if isinstance(sqlite.get("tokens"), dict) else 0)
            sqlite_output = int(sqlite.get("tokens", {}).get("output", 0) if isinstance(sqlite.get("tokens"), dict) else 0)
            sqlite_used = int(sqlite.get("tokens_used", 0))
            tokens_used = sqlite_used or (sqlite_input + sqlite_output)
            tokens = TokenSpend(input=sqlite_input or sqlite_used, output=sqlite_output)
            models = collections.Counter[str](sqlite.get("models") or {})
            model_usage = sqlite.get("model_usage") or {}
            daily = sqlite.get("daily") or {}
            daily_models = sqlite.get("daily_models") or {}
            events_count = int(sqlite.get("events_count") or 0)

        merged[name] = {
            "tokens_used": tokens_used,
            "tokens": tokens,
            "models": models,
            "model_usage": model_usage,
            "daily": daily,
            "daily_models": daily_models,
            "events_count": events_count,
            "last_seen": _max_iso(sqlite.get("last_seen"), jsonl.get("last_seen")),
        }
    return merged


def _max_iso(a: str | None, b: str | None) -> str | None:
    if a is None:
        return b
    if b is None:
        return a
    return a if a > b else b


def collect_agents(root: Path, state_path: Path | None = None) -> list[dict[str, Any]]:
    allowlist = configured_allowlist(root)
    inventory = collect_session_inventory(root)
    sqlite_usage = _sqlite_agents(root)
    jsonl_usage = _collect_jsonl_usage(root, state_path)
    usage = _merge_agent_records(sqlite_usage, jsonl_usage)
    agents: list[dict[str, Any]] = []
    for name in sorted(set(allowlist.get("agents", {})) | set(usage) | set(inventory)):
        record = usage.get(name, {})
        configured = allowlist.get("agents", {}).get(name, {})
        observed = record.get("models")
        if isinstance(observed, collections.Counter) and observed:
            model_id = observed.most_common(1)[0][0]
            if model_id in ("jsonl-derived", "delivery-mirror", "unavailable"):
                model_id = configured.get("model_id") or "unavailable"
        else:
            model_id = configured.get("model_id") or "unavailable"
        if model_id in ("jsonl-derived", "delivery-mirror"):
            model_id = configured.get("model_id") or "unavailable"
        counts = inventory.get(name, {"sessions": 0, "trajectories": 0})
        agents.append(
            {
                "name": name,
                "model_id": model_id,
                "tokens_used": int(record.get("tokens_used") or 0),
                "tokens": dict(record.get("tokens") or TokenSpend(input=0, output=0)),
                "models": dict(record.get("model_usage") or {}),
                "daily": dict(record.get("daily") or {}),
                "daily_models": dict(record.get("daily_models") or {}),
                "sessions_count": counts["sessions"],
                "trajectories_count": counts["trajectories"],
                "events_count": int(record.get("events_count") or 0),
                "last_seen": record.get("last_seen"),
            }
        )
    return agents


def collect_plugins(root: Path) -> list[str]:
    return sorted(allowed for allowed in configured_allowlist(root).get("plugins", {}))


def collect_mcp_servers(root: Path) -> list[str]:
    return sorted(allowed for allowed in configured_allowlist(root).get("mcp_servers", {}))


def collect_log_sources(root: Path, state_path: Path | None = None) -> list[dict[str, Any]]:
    candidates = [
        root / "workspace" / "logs" / "agendamento-medico-automation.log",
        root / "workspace-agendamento-notes" / "logs" / "agendamento-notes.log",
    ]
    state_file = state_path or DEFAULT_TOKEN_STATE_PATH
    state = _load_token_state(state_file)
    log_states = state.get("logs") if isinstance(state.get("logs"), dict) else {}
    rows: list[dict[str, Any]] = []
    for path in candidates:
        if not path.exists():
            continue
        try:
            size = path.stat().st_size
        except OSError:
            continue
        key = str(path)
        previous = log_states.get(key) if isinstance(log_states.get(key), dict) else {}
        offset = int(previous.get("offset", 0) or 0)
        reset = offset > size or "daily" not in previous
        if reset:
            offset = 0
        counts = {
            "lines": 0 if reset else int(previous.get("lines", 0) or 0),
            "errors": 0 if reset else int(previous.get("errors", 0) or 0),
            "deferred": 0 if reset else int(previous.get("deferred", 0) or 0),
            "success": 0 if reset else int(previous.get("success", 0) or 0),
        }
        daily = {} if reset else {
            str(day): {
                "lines": int(value.get("lines", 0) or 0),
                "errors": int(value.get("errors", 0) or 0),
                "deferred": int(value.get("deferred", 0) or 0),
                "success": int(value.get("success", 0) or 0),
            }
            for day, value in (previous.get("daily") or {}).items()
            if isinstance(value, dict)
        }
        try:
            with path.open("r", encoding="utf-8", errors="ignore") as handle:
                handle.seek(offset)
                for line in handle:
                    lowered = line.lower()
                    counts["lines"] += 1
                    date_match = re.search(r"\b(20\d{2})[-/](\d{2})[-/](\d{2})\b", line)
                    day_counts = None
                    if date_match:
                        day = "-".join(date_match.groups())
                        day_counts = daily.setdefault(day, {"lines": 0, "errors": 0, "deferred": 0, "success": 0})
                        day_counts["lines"] += 1
                    is_error = bool(re.search(r"error|exception|traceback|failed|failure", lowered))
                    is_deferred = bool(re.search(r"defer|deferred|pending|waiting", lowered))
                    is_success = bool(re.search(r"success|completed|merged|sent|scheduled|approved", lowered))
                    if is_error:
                        counts["errors"] += 1
                        if day_counts is not None:
                            day_counts["errors"] += 1
                    if is_deferred:
                        counts["deferred"] += 1
                        if day_counts is not None:
                            day_counts["deferred"] += 1
                    if is_success:
                        counts["success"] += 1
                        if day_counts is not None:
                            day_counts["success"] += 1
                new_offset = handle.tell()
        except OSError:
            continue
        log_states[key] = {"offset": new_offset, **counts, "daily": daily}
        today = datetime.now(timezone.utc).date()
        recent = {"lines": 0, "errors": 0, "deferred": 0, "success": 0}
        for days_ago in range(7):
            day = (today - timedelta(days=days_ago)).isoformat()
            for field in recent:
                recent[field] += int(daily.get(day, {}).get(field, 0) or 0)
        rows.append(
            {
                "name": path.name[:120],
                "size_bytes": size,
                "line_count": counts["lines"],
                "error_count": counts["errors"],
                "deferred_count": counts["deferred"],
                "success_count": counts["success"],
                "recent_7d": recent,
                "updated_at": _mtime_iso(path),
            }
        )
    state["logs"] = log_states
    _write_snapshot_atomic(state_file, state)
    return rows


def _load_ledger(path: Path) -> dict[str, Any]:
    value = read_json(path)
    return value if isinstance(value.get("totals"), dict) else {"totals": {}, "daily": {}}


def _token_spend(value: Any) -> TokenSpend:
    if isinstance(value, dict):
        return TokenSpend(
            input=max(0, int(value.get("input") or 0)),
            output=max(0, int(value.get("output") or 0)),
        )
    return TokenSpend(input=0, output=0)


def _previous_token_spend(ledger: dict[str, Any], name: str) -> TokenSpend:
    tokens_totals = ledger.get("tokens", {}).get("totals") if isinstance(ledger.get("tokens"), dict) else None
    if isinstance(tokens_totals, dict):
        previous = tokens_totals.get(name)
        if isinstance(previous, dict):
            return TokenSpend(
                input=max(0, int(previous.get("input", 0) or 0)),
                output=max(0, int(previous.get("output", 0) or 0)),
            )
    legacy_totals = ledger.get("totals")
    if isinstance(legacy_totals, dict):
        previous = legacy_totals.get(name)
        if isinstance(previous, (int, float, str)):
            return TokenSpend(input=int(previous), output=0)
    return TokenSpend(input=0, output=0)


def _previous_token_total(ledger: dict[str, Any], name: str) -> int:
    spend = _previous_token_spend(ledger, name)
    return spend["input"] + spend["output"]


def collect_token_history(
    output: Path, agents: list[dict[str, Any]]
) -> dict[str, Any]:
    """Persist cumulative totals plus calendar-day/model-dimensioned history."""
    ledger_path = output.with_name("openclaw-token-ledger.json")
    ledger = _load_ledger(ledger_path)
    today = datetime.now(timezone.utc).date().isoformat()

    token_totals: dict[str, TokenSpend] = {}
    total_models: dict[str, dict[str, TokenSpend]] = {}
    daily: dict[str, dict[str, TokenSpend]] = {}
    daily_models: dict[str, dict[str, dict[str, TokenSpend]]] = {}

    for agent in agents:
        name = agent["name"]
        spend = _token_spend(agent.get("tokens"))
        token_totals[name] = spend
        total_models[name] = {
            model: _token_spend(model_spend)
            for model, model_spend in (agent.get("models") or {}).items()
        }
        observed_daily = agent.get("daily") or {}
        observed_daily_models = agent.get("daily_models") or {}
        if observed_daily:
            for date, day_spend in observed_daily.items():
                daily.setdefault(date, {})[name] = _token_spend(day_spend)
            for date, models_for_day in observed_daily_models.items():
                daily_models.setdefault(date, {})[name] = {
                    model: _token_spend(model_spend)
                    for model, model_spend in models_for_day.items()
                }
        else:
            # SQLite-only agents do not have message timestamps; preserve the
            # old monotonic delta fallback until richer telemetry exists.
            previous = _previous_token_spend(ledger, name)
            current = _token_spend((ledger.get("daily") or {}).get(today, {}).get(name))
            current["input"] += max(0, spend["input"] - previous["input"])
            current["output"] += max(0, spend["output"] - previous["output"])
            daily.setdefault(today, {})[name] = current

    trimmed_dates = sorted(set(daily))[-365:]
    trimmed = {date: daily[date] for date in trimmed_dates}
    trimmed_models = {date: daily_models.get(date, {}) for date in trimmed_dates}
    ledger_payload: dict[str, Any] = {
        "totals": {name: spend["input"] + spend["output"] for name, spend in token_totals.items()},
        "daily": trimmed,
        "tokens": {
            "totals": {name: dict(spend) for name, spend in token_totals.items()},
            "total_models": total_models,
            "daily": trimmed,
            "daily_models": trimmed_models,
        },
    }
    _write_snapshot_atomic(ledger_path, ledger_payload)

    by_agent = sorted(
        [
            {
                "name": name,
                "model_id": agent.get("model_id"),
                "models": total_models.get(name, {}),
                "tokens_used": spend["input"] + spend["output"],
                "tokens": dict(spend),
            }
            for name, spend in token_totals.items()
            for agent in agents
            if agent["name"] == name
        ],
        key=lambda item: item["name"],
    )
    daily_out = [
        {
            "date": date,
            "tokens_used": sum(_token_spend(spend)["input"] + _token_spend(spend)["output"] for spend in entries.values()),
            "tokens": {
                "input": sum(_token_spend(spend)["input"] for spend in entries.values()),
                "output": sum(_token_spend(spend)["output"] for spend in entries.values()),
            },
        }
        for date, entries in trimmed.items()
    ]

    return {
        "total": sum(spend["input"] + spend["output"] for spend in token_totals.values()),
        "by_agent": by_agent,
        "daily": daily_out,
        "monetary_cost": "unavailable",
    }


def _write_snapshot_atomic(output: Path, value: dict[str, Any]) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    encoded = (
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
    )
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", dir=output.parent, prefix=f".{output.name}.", delete=False
    ) as temporary:
        temporary.write(encoded)
        temporary.flush()
        os.fsync(temporary.fileno())
        temporary_name = temporary.name
    os.chmod(temporary_name, 0o640)
    os.replace(temporary_name, output)


def validate_snapshot(value: Any, max_string: int = 512) -> None:
    """Recursively reject forbidden keys and oversized string values.

    The validator also rejects strings that look like large numeric
    identifiers or contain structured PII, because the snapshot is meant
    to be aggregate-only.
    """
    seen_forbidden: set[str] = set()

    def _is_suspicious(text: str) -> bool:
        # Large numbers that could be phone/document IDs, JIDs, or message IDs.
        if re.search(r"\b\d{9,}\b", text):
            return True
        # JID-like or email-like strings.
        if "@" in text and re.search(r"[a-zA-Z0-9_-]@[a-zA-Z0-9]", text):
            return True
        # Base64/hex blobs that could be tokens or keys.
        if len(text) >= 32 and re.fullmatch(r"[A-Za-z0-9+/=]{32,}|[a-f0-9]{32,}", text):
            return True
        return False

    def visit(current: Any, path: str = "") -> None:
        if isinstance(current, dict):
            for key, item in current.items():
                normalized_key = str(key).lower()
                if FORBIDDEN_KEY.search(normalized_key):
                    seen_forbidden.add(str(key))
                visit(item, f"{path}.{key}")
        elif isinstance(current, list):
            for index, item in enumerate(current):
                visit(item, f"{path}[{index}]")
        elif isinstance(current, str):
            if len(current) > max_string:
                raise ValueError(f"snapshot string exceeds aggregate-only limit at {path}")
            if _is_suspicious(current):
                raise ValueError(f"snapshot string contains suspicious value at {path}")

    visit(value)
    if seen_forbidden:
        raise ValueError(f"forbidden snapshot field(s): {', '.join(sorted(seen_forbidden))}")


def build_snapshot(
    root: Path = DEFAULT_OPENCLAW_ROOT,
    command: Command = run_command,
    output: Path | None = None,
    state_path: Path | None = None,
) -> dict[str, Any]:
    gateway_show = command(
        [
            "systemctl",
            "--user",
            "show",
            "openclaw-gateway.service",
            "--property=ActiveState,SubState,MainPID,MemoryCurrent,MemoryMax,TasksCurrent,TasksMax,NRestarts,ExecMainStartTimestamp",
        ]
    )
    agents = collect_agents(root, state_path=state_path)
    target = output or DEFAULT_OUTPUT
    snapshot = {
        "schema": SCHEMA,
        "collected_at": utc_now(),
        "availability": {"collector": "available", "monetary_cost": "unavailable"},
        "gateway": {
            "service": parse_systemd_show(gateway_show),
            "health": gateway_health(command),
        },
        "whatsapp": collect_whatsapp(command),
        "services": collect_services(command),
        "ports": collect_ports(command),
        "agents": agents,
        "plugins": collect_plugins(root),
        "mcp_servers": collect_mcp_servers(root),
        "timers": collect_timers(command),
        "crons": collect_crons(command),
        "flows": collect_flows(root),
        "logs": collect_log_sources(root, state_path=state_path),
        "tokens": collect_token_history(target, agents),
    }
    return snapshot


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write a sanitized OpenClaw observability snapshot"
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--root", type=Path, default=DEFAULT_OPENCLAW_ROOT)
    parser.add_argument(
        "--token-state", type=Path, default=DEFAULT_TOKEN_STATE_PATH, help="path to incremental JSONL token state"
    )
    parser.add_argument(
        "--check", action="store_true", help="collect and validate without writing"
    )
    args = parser.parse_args()
    snapshot = build_snapshot(root=args.root, output=args.output, state_path=args.token_state)
    validate_snapshot(snapshot)
    if not args.check:
        _write_snapshot_atomic(args.output, snapshot)
    print(
        json.dumps(
            {
                "schema": snapshot["schema"],
                "collected_at": snapshot["collected_at"],
                "written": not args.check,
            },
            separators=(",", ":"),
        )
    )


if __name__ == "__main__":
    main()
