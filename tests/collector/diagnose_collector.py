#!/usr/bin/env python3
"""Diagnostic smoke run for collect-openclaw-snapshot.py."""

from __future__ import annotations

import importlib.util
import json
import sqlite3
import tempfile
from pathlib import Path


def main():
    collector_path = Path("scripts/collect-openclaw-snapshot.py").resolve()
    spec = importlib.util.spec_from_file_location("collector", collector_path)
    assert spec and spec.loader
    collector = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(collector)

    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory) / "openclaw"
        (root / "agents" / "main" / "agent" / "codex-home").mkdir(parents=True)
        (root / "workspace" / "state").mkdir(parents=True)
        (root / "workspace-agendamento-notes" / "state").mkdir(parents=True)
        (root / "openclaw.json").write_text(
            json.dumps(
                {
                    "agents": {"main": {"model": "codex/gpt-5.5"}},
                    "plugins": {"entries": {"slack": {"token": "should-not-appear"}}},
                }
            )
        )
        (root / "workspace" / "state" / "agendamento-medico.json").write_text(
            json.dumps({"pending": [{"name": "private person"}]})
        )
        db_path = root / "agents" / "main" / "agent" / "codex-home" / "state_5.sqlite"
        connection = sqlite3.connect(db_path)
        connection.execute(
            "CREATE TABLE threads (id TEXT PRIMARY KEY, model TEXT, tokens_used INTEGER, updated_at TEXT)"
        )
        connection.execute(
            "INSERT INTO threads VALUES ('t1', 'codex/gpt-5.5', 100, '2026-07-10T10:00:00Z')"
        )
        connection.commit()
        connection.close()

        output = Path(directory) / "snapshot.json"
        snapshot = collector.build_snapshot(root=root, command=lambda _cmd: "", output=output)
        print("--- snapshot ---")
        print(json.dumps(snapshot, indent=2))
        print("--- validation ---")
        collector.validate_snapshot(snapshot)
        print("validation=pass")
        print("--- serialized forbidden scan ---")
        ser = json.dumps(snapshot).lower()
        for forbidden in ("should-not-appear", "private person", "token"):
            print(forbidden, forbidden in ser)


if __name__ == "__main__":
    main()
