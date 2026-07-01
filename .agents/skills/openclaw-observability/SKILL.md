---
name: openclaw-observability
description: Use when adding OpenClaw monitoring collection, API routes, auth, Nginx/systemd deployment, logs, costs, or dashboard metrics. Keeps output read-only, aggregated, and safe for a public operations dashboard.
version: 1.1.0
author: Hermes Agent
license: Proprietary
metadata:
  hermes:
    tags: [openclaw, observability, monitoring, nginx, systemd, logs, costs, auth]
    related_skills: [ui-design]
---

# OpenClaw Observability Skill

## Purpose

Observe OpenClaw without exposing private operational data. The dashboard should show aggregate status, counts, timestamps, process/resource metrics, and named services/jobs only.

## Safe Data Sources

Use read-only sources on the OpenClaw VPS:

- `systemctl --user show openclaw-gateway.service` for state, PID, memory, tasks, limits, and restart count.
- `systemctl --user list-timers --all` for watchdog and cron cadence.
- `crontab -l` summarized into job names, cadence, and target category.
- `ss -lntp` summarized into public/local ports and process names.
- `docker ps --format` for container names, images, status, and ports.
- `~/.openclaw/openclaw.json` parsed only for safe top-level metadata: plugin names, MCP names, agent names, model IDs.
- State files summarized into counts/status buckets only.
- Logs summarized into counters and buckets; do not display raw log lines.

## Data Boundaries

Dashboard/API output may include:

- service names;
- job names;
- health states;
- counts;
- file sizes;
- timestamps;
- port numbers;
- model/provider IDs when already non-secret.

Dashboard/API output must not include:

- gateway auth token;
- API keys, OAuth tokens, cookies, passwords, secrets;
- raw Slack/Telegram/WhatsApp payloads;
- patient/clinic/person names, phone numbers, documents, OTPs, or message text;
- full `openclaw.json`, `.env`, state JSON, trajectory JSONL, SQLite logs, or journal lines.

## Cost Monitoring Plan

Costs require instrumentation. Do not invent values.

Phase 1 may show:

- provider/model inventory;
- session/event counts;
- whether token usage exists;
- data collection backlog.

Phase 2 should add:

- per-run token extraction from OpenClaw/Codex traces when usage is present;
- checked-in sanitized provider price map;
- daily JSON/SQLite rollups;
- optional AWS Cost Explorer or fixed Lightsail instance cost.

## Auth Rules

- Keep credentials in server `.env`: `DASHBOARD_AUTH_USER`, `DASHBOARD_AUTH_PASSWORD`, `AUTH_SECRET`.
- `.env` must remain ignored; only `.env.example` is committed.
- Use HTTP-only cookie authentication for this single-user dashboard stage.
- Set `AUTH_COOKIE_SECURE=true` only when the dashboard is served over HTTPS.

## Deployment Rules

- Next.js binds to `127.0.0.1:3100` behind Nginx.
- Nginx is the public entry point with `server_name 54.175.2.242 _;`.
- Do not expose the OpenClaw gateway (`127.0.0.1:18789`).
- Public port 80 is for the dashboard only.
- User systemd service must load `.env` and run Yarn.

## Verification Checklist

- [ ] Collector/dashboard emits aggregate data only.
- [ ] `.env` exists on the VPS and is not committed.
- [ ] App binds to loopback when behind Nginx.
- [ ] Nginx proxies to `127.0.0.1:3100` and includes the server IP.
- [ ] `/login` renders publicly; `/` redirects when unauthenticated.
- [ ] Authenticated `/` returns dashboard HTML.
- [ ] Logout clears the cookie.
- [ ] `yarn audit --level moderate`, `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn build` pass.
