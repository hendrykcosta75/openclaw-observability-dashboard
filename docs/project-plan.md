# OpenClaw Observability Dashboard Project Plan

## Goal

Build a private, authenticated dashboard for OpenClaw operations on the Lightsail VPS.

## Current Phase

Phase 1 turns the authenticated layout into a tighter operations dashboard:

- cookie-based login from server `.env`;
- Baisync-like sidebar and card layout;
- reduced AI-slop copy;
- HeroUI v3 component discipline;
- Yarn-first workflow;
- Playwright browser checks;
- deploy templates for Nginx/systemd.

## Acceptance Criteria

- `/` redirects to `/login` without a valid session.
- `/login` accepts `DASHBOARD_AUTH_USER` and `DASHBOARD_AUTH_PASSWORD` from `.env`.
- Auth creates an HTTP-only signed cookie.
- Logout clears the cookie.
- Sidebar contains `Dashboard`, `Logs`, `Agentes`, `Gateway`, `Crons`, `Custos`, `Plano`.
- The UI does not show `sem segredos`, `sem PII`, `sem logs brutos`, `Command Center`, or generic AI marketing phrases.
- `yarn audit --level moderate`, `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn build` pass.
- Nginx serves the app at `http://54.175.2.242/` and `/healthz` remains available.

## Phase 2 — Live Collector

- Add a read-only collector that writes aggregate JSON on a timer.
- Keep collection out of request-time rendering.
- Store daily history for resource usage, crons, errors, and agent activity.

## Phase 3 — Cost Rollups

- Discover a reliable token/usage source in OpenClaw/Codex traces.
- Add a sanitized provider/model price map.
- Roll up cost by day, agent, provider, and workflow.
- Explicitly label estimates versus provider-confirmed values.

## Phase 4 — Operational Alerts

- Add health thresholds for gateway RSS/tasks, timers, crons, and MCP failures.
- Add incident cards with only aggregate metadata.
- Link to playbooks and skills, not sensitive files.
