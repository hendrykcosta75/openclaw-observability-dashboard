# OpenClaw Observability Dashboard

Private operations dashboard for OpenClaw on the Lightsail VPS.

## What it shows

- gateway status and resource limits;
- agents and recent activity buckets;
- crons and systemd timers;
- log counters and state counts;
- cost instrumentation plan;
- deploy and collection roadmap.

The dashboard uses an aggregated snapshot in `lib/openclaw-snapshot.ts`. Raw logs, OpenClaw configs, credentials, payloads and private message content are not rendered.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- HeroUI v3
- Playwright
- Yarn Classic

## Local setup

```bash
yarn install
cp .env.example .env
# edit .env and replace every placeholder
yarn dev --hostname 127.0.0.1 --port 3100
```

Open `http://127.0.0.1:3100/login` and sign in with the `.env` credentials.

## Required environment variables

```dotenv
DASHBOARD_AUTH_USER=admin
DASHBOARD_AUTH_PASSWORD=change-this-password
AUTH_SECRET=replace-with-a-random-32-byte-or-longer-secret
AUTH_COOKIE_SECURE=false
```

Set `AUTH_COOKIE_SECURE=true` only after HTTPS is configured.

## Verification

Run before deploy:

```bash
yarn audit --level moderate
yarn lint
yarn typecheck
yarn test
yarn build
```

Expected public checks after deploy:

```bash
curl -I http://54.175.2.242/
curl http://54.175.2.242/healthz
```

## Deploy layout

- VPS repo: `/home/ubuntu/openclaw-observability-dashboard`
- systemd user service: `openclaw-observability-dashboard.service`
- Next.js bind: `127.0.0.1:3100`
- Nginx entrypoint: `http://54.175.2.242/`
- healthcheck: `/healthz`

Templates:

- `deploy/systemd/openclaw-observability-dashboard.service`
- `deploy/nginx/openclaw-observability-dashboard.conf`

## Agent harness

- `AGENTS.md` is the source of truth for agents.
- `CLAUDE.md` forwards to `AGENTS.md`.
- `.agents/skills/ui-design/SKILL.md` defines UI/HeroUI/anti-slop rules.
- `.agents/skills/openclaw-observability/SKILL.md` defines safe collection and deploy rules.
- `docs/project-plan.md` tracks roadmap and acceptance criteria.

## License

Proprietary. See `LICENSE`.
