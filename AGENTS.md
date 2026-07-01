# OpenClaw Dashboard Harness

This repository builds the OpenClaw observability dashboard with Next.js, Tailwind CSS v4, HeroUI v3, and a small cookie-based auth layer.

## Required Skills Before Editing

1. Before editing any `.tsx`, `.ts`, or `.css`, read `.agents/skills/ui-design/SKILL.md`.
2. Before editing auth, collection, API routes, systemd, Nginx, metrics, logs, or deploy files, read `.agents/skills/openclaw-observability/SKILL.md`.
3. Use Yarn only. Do not introduce `package-lock.json` or npm commands.
4. Do not commit `.env`, tokens, passwords, OpenClaw configs, payloads, patient/clinic data, OTPs, private URLs, raw logs, or credentials.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- HeroUI v3 (`@heroui/react`, `@heroui/styles`)
- Playwright for browser checks
- Yarn Classic (`packageManager: yarn@1.22.22`)

## Development Commands

```bash
yarn install
yarn dev --hostname 127.0.0.1 --port 3100
yarn lint
yarn typecheck
yarn test
yarn build
yarn audit --level moderate
yarn start --hostname 127.0.0.1 --port 3100
```

## Environment

Copy `.env.example` to `.env` on the server and replace all values:

```dotenv
DASHBOARD_AUTH_USER=admin
DASHBOARD_AUTH_PASSWORD=replace-this
AUTH_SECRET=replace-with-random-32-byte-secret
AUTH_COOKIE_SECURE=false
```

Set `AUTH_COOKIE_SECURE=true` only when serving over HTTPS.

## Functional Verification Metrics

A change is not complete until these checks pass:

1. Dependency security: `yarn audit --level moderate` returns zero vulnerabilities or documented non-blocking findings.
2. Static quality: `yarn lint` passes.
3. Types: `yarn typecheck` passes.
4. Browser tests: `yarn test` passes.
5. Production build: `yarn build` passes.
6. Runtime local:
   - unauthenticated `GET /` redirects to `/login`;
   - `/login` renders the login form;
   - valid credentials reach `/`;
   - dashboard shows `OpenClaw Operations`, `Gateway`, `Logs`, and `Agentes`;
   - logout returns to `/login`.
7. Runtime through Nginx:
   - `curl -I http://54.175.2.242/` returns a redirect to `/login` when unauthenticated;
   - `curl http://54.175.2.242/healthz` returns `openclaw-observability-dashboard ok`.
8. Browser/Playwright or browser tool confirmation captures the actual public UI, not only curl output.
9. Public deployment currently uses plain HTTP on the instance IP. Treat HTTPS + `AUTH_COOKIE_SECURE=true` as required before using the dashboard on an untrusted network.

## Design Baseline

Follow Baisync dashboard structure:

- dark `bg-app` shell;
- translucent/glass left sidebar;
- sticky header;
- dense card grid;
- orange accent;
- mono labels and numbers;
- HeroUI v3 components with local classes.

Sidebar items should stay operational and short: `Dashboard`, `Logs`, `Agentes`, `Gateway`, `Crons`, `Custos`, `Plano`.

## Copy Standard

Avoid generic AI/SaaS language. Do not add badges such as `sem segredos`, `sem PII`, or `sem logs brutos` to the UI. Keep privacy and data-safety requirements in docs/skills and show operational data in the product.

## Deployment Notes

- VPS repo: `/home/ubuntu/openclaw-observability-dashboard`
- User systemd service: `openclaw-observability-dashboard.service`
- Next.js local port: `127.0.0.1:3100`
- Nginx public URL: `http://54.175.2.242/`
- Healthcheck: `http://54.175.2.242/healthz`
