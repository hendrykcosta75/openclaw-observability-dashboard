---
name: openclaw-observability
description: Use when adding OpenClaw monitoring data collection, API routes, scripts, Nginx/systemd deployment, or dashboard metrics. Keeps collection read-only, sanitized, and safe for a public dashboard.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [openclaw, observability, monitoring, nginx, systemd, logs, costs]
    related_skills: [ui-design]
---

# OpenClaw Observability Skill

## Overview

The dashboard must observe OpenClaw without exposing secrets or private operational data. Collect only aggregate counts, health states, file sizes, timestamps, process/resource metrics, and sanitized event categories.

## Safe Data Sources

Read-only sources on the OpenClaw VPS:

- `systemctl --user show openclaw-gateway.service` for state, PID, memory, tasks and limits.
- `systemctl --user list-timers --all` for watchdog/cron cadence.
- `crontab -l` summarized into job names/cadences/targets.
- `ss -lntp` summarized into public/local ports.
- `docker ps --format` for container names/images/status/ports.
- `~/.openclaw/openclaw.json` parsed only for top-level keys and safe names: plugins, MCP servers, agents, model IDs. Never emit values matching token/password/key/secret.
- Known state files summarized into counts/status buckets only.
- Logs summarized into counters and buckets; never render raw log lines.

## Explicitly Forbidden in Dashboard/API Output

- Gateway auth token.
- API keys, OAuth tokens, cookies or credential file paths with values.
- Raw Slack/Telegram/WhatsApp payloads.
- Patient/clinic names, phone numbers, documents, OTPs, message text.
- Full `openclaw.json`, `.env`, state JSON, trajectory JSONL, SQLite logs or journal lines.

## Cost Monitoring Plan

Costs require instrumentation; do not invent numbers.

Phase 1 layout may show:

- provider/model inventory;
- session/event counts;
- whether token usage is present or missing;
- collection backlog.

Phase 2 should add:

- per-run token extractor from OpenClaw/Codex traces if usage appears;
- provider price map in a checked-in sanitized config;
- daily rollups in local JSON/SQLite;
- optional AWS Cost Explorer for Lightsail fixed infra cost.

## Deployment Rules

- Next.js app should bind to `127.0.0.1:3100`.
- Nginx should be the public entry point with `server_name 54.175.2.242 _;`.
- Do not expose OpenClaw gateway (`127.0.0.1:18789`) publicly.
- Open only the dashboard HTTP port requested; prefer public TCP/80 proxied to local 3100.
- Use a dedicated systemd user service for the Next app and verify with `curl` locally and publicly.

## Verification Checklist

- [ ] Local collector emits sanitized aggregate JSON only.
- [ ] App binds to loopback, not `0.0.0.0`, when behind Nginx.
- [ ] Nginx config includes the server IP and proxies to localhost.
- [ ] Public AWS/Lightsail port is open only for the intended HTTP endpoint.
- [ ] `/` returns the dashboard HTML through Nginx.
- [ ] No raw secrets or PII in page source.
