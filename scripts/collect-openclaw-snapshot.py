#!/usr/bin/env python3
"""Sanitized OpenClaw snapshot collector placeholder.

Future phase: run this on the OpenClaw VPS via systemd timer and write JSON for the dashboard.
Current phase keeps data static in lib/openclaw-snapshot.ts.
"""

from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone


def run(cmd: list[str]) -> str:
    return subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL, timeout=10)


def main() -> None:
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "schema": "openclaw-observability-snapshot/v1",
        "note": "placeholder collector; add only sanitized aggregate metrics",
    }
    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
