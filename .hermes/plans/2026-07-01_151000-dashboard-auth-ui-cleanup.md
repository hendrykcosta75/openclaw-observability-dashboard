# Dashboard Auth and Anti-AI-Slop Cleanup Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Clean up the OpenClaw dashboard UI so it feels like a precise operational product instead of generic AI output, add cookie-based authentication from `.env`, standardize the repo on Yarn, and strengthen project/agent documentation and validation.

**Architecture:** Keep the dashboard as a Next.js App Router app behind Nginx, but split the current client-only dashboard into a protected server page plus a client dashboard shell. Authentication will use a small signed HTTP-only cookie created by a Next.js route handler from credentials stored in `.env`; no external auth provider or database is needed for this stage. UI rules and project instructions will be updated so future changes use HeroUI documentation, concrete operational copy, Playwright/browser checks, Yarn, and explicit verification gates.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, HeroUI v3, Lucide icons, Playwright, Yarn Classic via Corepack, signed HTTP-only cookie with Node `crypto`.

---

## Current Context

Repo: `/root/work/openclaw-observability-dashboard`

Current deployed VPS repo: `/home/ubuntu/openclaw-observability-dashboard`

Current public URL: `http://54.175.2.242/`

Relevant current files:

- `app/page.tsx` — single client component containing the entire dashboard.
- `app/globals.css` — Baisync-like design tokens and custom classes.
- `lib/openclaw-snapshot.ts` — static sanitized inventory data and nav data.
- `.agents/skills/ui-design/SKILL.md` — English skill, but currently says dashboard buttons should be native `<button>/<a>` instead of always using HeroUI where appropriate.
- `.agents/skills/openclaw-observability/SKILL.md` — English observability/data-safety skill.
- `AGENTS.md` — Portuguese, uses npm commands, lacks browser/Playwright and audit verification metrics.
- `README.md` — Portuguese, npm commands, no auth/deployment/env details.
- `.gitignore` — already ignores `.env` and `.env.*` while allowing `.env.example`.
- `package.json` — npm-oriented scripts, no Playwright, no test script, has `package-lock.json`.

Current UI issues called out by the user:

- The badge text `sem segredos · sem PII · sem logs brutos` at `app/page.tsx:385-387` feels like AI slop and should be removed.
- Other generic/AI-ish phrases should be tightened.
- Sidebar should be Baisync-like and include operational items like `Dashboard`, `Logs`, `Agentes`, etc.
- Skills should be in English and should encode anti-AI-slop design guidance.
- HeroUI should be the default UI component source, with documentation links referenced in the design skill.
- Project docs should include browser/Playwright and command verification metrics.
- Use Yarn instead of npm.
- Add `CLAUDE.md` containing only `@AGENTS.md`.
- Add a project plan under `docs/`.
- Add login screen and `.env`-configured username/password authentication.
- Add `.env.example`.
- Add proprietary license.

## External Documentation Researched

### OpenAI GPT instruction guidance

Source: <https://help.openai.com/en/articles/9358033-key-guidelines-for-writing-instructions-for-custom-gpts>

Apply these documented principles to repo skills and UI copy:

- Use explicit step structures for multi-step workflows.
- Separate instruction sections with clear delimiters.
- Prefer positive, concrete instructions over long prohibition lists.
- Include examples of acceptable and unacceptable outputs when definitions/classifications matter.
- Use headings and lists so priorities and steps are visually distinct.
- Tighten instructions and add examples before adding more tools/features.

### HeroUI documentation

Primary component docs index: <https://heroui.com/docs/react/components>

Component docs pattern to include in the skill:

```text
https://heroui.com/docs/react/components/{component-name}.mdx
```

Examples:

```text
https://heroui.com/docs/react/components/card.mdx
https://heroui.com/docs/react/components/button.mdx
https://heroui.com/docs/react/components/input.mdx
https://heroui.com/docs/react/components/form.mdx
https://heroui.com/docs/react/components/chip.mdx
```

Implementation rule: before adding or changing HeroUI components, fetch the specific component docs and use the v3 compound/component patterns. No `HeroUIProvider`.

---

## Proposed Approach

1. Convert the repo to Yarn-first development and deployment.
2. Add a simple signed-cookie authentication layer:
   - `.env` values: `DASHBOARD_AUTH_USER`, `DASHBOARD_AUTH_PASSWORD`, `AUTH_SECRET`.
   - Public route: `/login`.
   - Protected route: `/`.
   - Auth route handlers: `/api/auth/login`, `/api/auth/logout`.
   - Dashboard page becomes a server wrapper that validates the cookie, then renders the client dashboard shell.
3. Clean the dashboard copy and structure:
   - Remove the `sem segredos · sem PII · sem logs brutos` badge entirely.
   - Replace generic phrases like `Command Center`, `Pronto para a fase...`, and virtue-signaling safety copy with concrete operational language.
   - Keep security/sanitization rules in docs/skills, not as marketing UI copy.
4. Rework the sidebar to be a clear operational nav:
   - `Dashboard`
   - `Logs`
   - `Agentes`
   - `Gateway`
   - `Crons`
   - `Custos`
   - `Plano`
5. Update skills and docs:
   - Keep both skills English.
   - Add OpenAI instruction-writing guidance and anti-AI-slop design standards.
   - Add HeroUI docs links and always-use-HeroUI rules.
   - Add AGENTS verification gates for Yarn, audit, lint, typecheck, tests, build, and browser/Playwright.
   - Add `CLAUDE.md`, `docs/project-plan.md`, proprietary `LICENSE`, `.env.example`, README refresh.
6. Add Playwright tests for auth and basic dashboard rendering.
7. Rebuild and redeploy using Yarn, then verify through local and public URLs.

---

## Step-by-Step Tasks

### Task 1: Confirm clean workspace and create a feature branch

**Objective:** Start implementation from a known clean state without mixing unrelated changes.

**Files:** none

**Step 1: Check status**

Run:

```bash
cd /root/work/openclaw-observability-dashboard
git status --short --branch
```

Expected:

```text
## master
```

If output contains modified/untracked files, stop and inspect before proceeding.

**Step 2: Create branch**

Run:

```bash
git switch -c feat/auth-ui-copy-cleanup
```

Expected: new branch created.

**Step 3: Commit**

No commit for this task.

---

### Task 2: Switch the repo to Yarn and add Playwright dependency

**Objective:** Make Yarn the canonical package manager and prepare for browser verification.

**Files:**

- Modify: `package.json`
- Delete: `package-lock.json`
- Create: `yarn.lock`

**Step 1: Enable Yarn through Corepack**

Run:

```bash
cd /root/work/openclaw-observability-dashboard
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn --version
```

Expected:

```text
1.22.22
```

**Step 2: Update `package.json`**

Modify `package.json` to add `packageManager`, use Yarn-friendly scripts, and add Playwright:

```json
{
  "name": "openclaw-observability-dashboard",
  "version": "0.1.0",
  "private": true,
  "packageManager": "yarn@1.22.22",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "playwright test",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "audit": "yarn audit --level moderate"
  },
  "dependencies": {
    "@heroui/react": "3.0.1",
    "@heroui/styles": "3.0.1",
    "@tailwindcss/typography": "^0.5.19",
    "lucide-react": "^0.513.0",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "recharts": "^3.8.1",
    "tailwindcss": "^4.2.2"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@playwright/test": "^1.57.0",
    "@tailwindcss/postcss": "^4.2.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "postcss": "^8.5.6",
    "typescript": "^5"
  },
  "overrides": {
    "next": {
      "postcss": "8.5.10"
    }
  }
}
```

Note: if Yarn 1 does not honor nested `overrides`, use Yarn `resolutions` instead:

```json
"resolutions": {
  "next/postcss": "8.5.10",
  "postcss": "^8.5.10"
}
```

Prefer whatever makes `yarn audit --level moderate` pass without downgrading Next.

**Step 3: Replace lockfile**

Run:

```bash
rm -f package-lock.json
yarn install
```

Expected:

- `yarn.lock` is created.
- `package-lock.json` is removed.

**Step 4: Verify**

Run:

```bash
yarn lint
yarn typecheck
yarn build
yarn audit --level moderate
```

Expected:

- lint passes
- typecheck passes
- build passes
- audit reports no moderate/high vulnerabilities, or only documented false positives with a remediation note

**Step 5: Commit**

```bash
git add package.json yarn.lock
git rm package-lock.json
git commit -m "chore: switch dashboard to yarn"
```

---

### Task 3: Add environment example for dashboard auth

**Objective:** Document required auth configuration without committing secrets.

**Files:**

- Create: `.env.example`
- Verify: `.gitignore`

**Step 1: Create `.env.example`**

Create `.env.example`:

```dotenv
# OpenClaw Observability Dashboard auth
# Copy to .env on the server and replace every value before deploying.
DASHBOARD_AUTH_USER=admin
DASHBOARD_AUTH_PASSWORD=change-this-password
AUTH_SECRET=replace-with-a-random-32-byte-or-longer-secret
```

**Step 2: Verify `.gitignore` keeps secrets out**

Current `.gitignore` already contains:

```gitignore
.env
.env.*
!.env.example
```

Keep these lines.

**Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: document dashboard auth env"
```

---

### Task 4: Add signed-cookie auth helper

**Objective:** Provide a small server-only auth utility for signed cookie creation and verification.

**Files:**

- Create: `lib/auth.ts`

**Step 1: Create `lib/auth.ts`**

```ts
import crypto from "crypto";

export const AUTH_COOKIE_NAME = "openclaw_dashboard_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

function requireEnv(name: "DASHBOARD_AUTH_USER" | "DASHBOARD_AUTH_PASSWORD" | "AUTH_SECRET") {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", requireEnv("AUTH_SECRET"))
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function isValidCredentials(username: string, password: string) {
  return username === requireEnv("DASHBOARD_AUTH_USER") && password === requireEnv("DASHBOARD_AUTH_PASSWORD");
}

export function createSessionToken(username: string, nowMs = Date.now()) {
  const now = Math.floor(nowMs / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined | null, nowMs = Date.now()) {
  if (!token) return null;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  const expected = sign(encodedPayload);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    const now = Math.floor(nowMs / 1000);

    if (!payload.sub || typeof payload.exp !== "number" || payload.exp < now) {
      return null;
    }

    if (payload.sub !== requireEnv("DASHBOARD_AUTH_USER")) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
```

**Step 2: Verify typecheck**

Run:

```bash
yarn typecheck
```

Expected: pass.

**Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add signed cookie auth helper"
```

---

### Task 5: Add login and logout API routes

**Objective:** Create route handlers that issue and clear the signed HTTP-only session cookie.

**Files:**

- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`

**Step 1: Create login route**

Create `app/api/auth/login/route.ts`:

```ts
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isValidCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

type LoginBody = {
  username?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid user or password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
```

**Step 2: Create logout route**

Create `app/api/auth/logout/route.ts`:

```ts
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
```

**Step 3: Verify typecheck**

Run:

```bash
yarn typecheck
```

Expected: pass.

**Step 4: Commit**

```bash
git add app/api/auth/login/route.ts app/api/auth/logout/route.ts
git commit -m "feat: add auth route handlers"
```

---

### Task 6: Split the dashboard into a protected server page and client shell

**Objective:** Protect `/` while preserving the existing dashboard UI as a client component.

**Files:**

- Create: `components/dashboard/dashboard-shell.tsx`
- Modify: `app/page.tsx`

**Step 1: Move current dashboard UI**

Create directory:

```bash
mkdir -p components/dashboard
```

Move the current contents of `app/page.tsx` into `components/dashboard/dashboard-shell.tsx`.

At the top of the new file, keep:

```tsx
"use client";
```

Rename the exported component from `Home` to `DashboardShell`:

```tsx
export function DashboardShell() {
  return (
    // existing dashboard JSX
  );
}
```

Remove any default export from `components/dashboard/dashboard-shell.tsx` unless needed.

**Step 2: Replace `app/page.tsx` with server auth wrapper**

Use this complete `app/page.tsx`:

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  return <DashboardShell />;
}
```

**Step 3: Verify typecheck**

Run with env values so auth code can evaluate if invoked:

```bash
DASHBOARD_AUTH_USER=admin DASHBOARD_AUTH_PASSWORD=admin AUTH_SECRET=test-secret yarn typecheck
```

Expected: pass.

**Step 4: Commit**

```bash
git add app/page.tsx components/dashboard/dashboard-shell.tsx
git commit -m "feat: protect dashboard route"
```

---

### Task 7: Create the login screen using HeroUI

**Objective:** Add a polished but restrained login page that matches the dashboard without generic AI styling.

**Files:**

- Create: `app/login/page.tsx`

**Step 1: Fetch HeroUI docs before implementation**

Use the docs URLs in `.agents/skills/ui-design/SKILL.md` when implementing. Read at least:

```text
https://heroui.com/docs/react/components/card.mdx
https://heroui.com/docs/react/components/button.mdx
https://heroui.com/docs/react/components/input.mdx
https://heroui.com/docs/react/components/form.mdx
```

**Step 2: Create login page**

Create `app/login/page.tsx`:

```tsx
"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@heroui/react";
import { LockKeyhole } from "lucide-react";

const mono = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } as const;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 text-body">
      <div className="decorative-orb" style={{ width: 420, height: 420, top: -170, right: -160, opacity: 0.28 }} />
      <div className="decorative-orb" style={{ width: 280, height: 280, bottom: -120, left: -100, opacity: 0.14 }} />

      <Card className="relative z-10 w-full max-w-[420px] p-5">
        <Card.Header className="flex flex-col items-start gap-4 p-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(255,107,44,0.08)] text-[#D4835A] glow-orange">
            <LockKeyhole size={19} />
          </div>
          <div>
            <Card.Title className="text-xl text-heading" style={mono}>OpenClaw dashboard</Card.Title>
            <Card.Description className="mt-1 text-sm text-subtle">
              Acesso restrito ao painel operacional.
            </Card.Description>
          </div>
        </Card.Header>

        <Card.Content className="mt-6 p-0">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              data-testid="login-username"
              label="Usuário"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              isRequired
            />
            <Input
              data-testid="login-password"
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              isRequired
            />

            {error && (
              <p data-testid="login-error" className="rounded-[10px] border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button data-testid="login-submit" type="submit" color="accent" className="w-full" isDisabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </main>
  );
}
```

Note: If HeroUI v3 `Button` uses `isDisabled` or `disabled` differently in current docs, follow the fetched docs and adjust accordingly.

**Step 3: Verify**

Run:

```bash
yarn typecheck
yarn lint
```

Expected: pass.

**Step 4: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add dashboard login page"
```

---

### Task 8: Add logout action to the dashboard header

**Objective:** Allow the user to clear the session and return to login.

**Files:**

- Modify: `components/dashboard/dashboard-shell.tsx`

**Step 1: Add imports**

In `components/dashboard/dashboard-shell.tsx`, add:

```tsx
import { Button } from "@heroui/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
```

If `Button` conflicts with existing imports, combine it with existing HeroUI imports.

**Step 2: Update `Header`**

Inside `Header`, add router and logout handler:

```tsx
function Header() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    // existing header JSX
  );
}
```

Add a HeroUI button in the right-side actions:

```tsx
<Button
  data-testid="logout-button"
  size="sm"
  variant="ghost"
  onPress={handleLogout}
  className="text-subtle"
>
  <LogOut size={14} />
  Sair
</Button>
```

**Step 3: Verify**

Run:

```bash
yarn typecheck
yarn lint
```

Expected: pass.

**Step 4: Commit**

```bash
git add components/dashboard/dashboard-shell.tsx
git commit -m "feat: add dashboard logout action"
```

---

### Task 9: Remove AI-slop safety badge and tighten hero copy

**Objective:** Replace generic/performative UI copy with concrete operational product copy.

**Files:**

- Modify: `components/dashboard/dashboard-shell.tsx`
- Modify: `lib/openclaw-snapshot.ts`

**Step 1: Remove the badge**

In `components/dashboard/dashboard-shell.tsx`, remove the entire block that renders:

```tsx
<div className="mb-3 inline-flex ...">
  <LockKeyhole size={12} /> sem segredos · sem PII · sem logs brutos
</div>
```

Also remove `LockKeyhole` from imports if unused after the login page split.

**Step 2: Replace hero title and description**

Replace:

```tsx
OpenClaw <span className="text-gradient">Observability</span> Command Center
```

with:

```tsx
OpenClaw <span className="text-gradient">observability</span>
```

Replace the description with:

```tsx
Gateway, jobs, agents, cost instrumentation, and sanitized log counters from the OpenClaw VPS inventory.
```

This is shorter, operational, and does not advertise safety as a decorative badge.

**Step 3: Tighten snapshot card**

Replace the snapshot card title/description:

```tsx
<Card.Title ...>Fonte do snapshot</Card.Title>
<Card.Description ...>Coleta read-only via SSH no OpenClaw.</Card.Description>
```

with:

```tsx
<Card.Title ...>Inventory snapshot</Card.Title>
<Card.Description ...>Last read-only capture from the VPS.</Card.Description>
```

Remove this rendered line entirely:

```tsx
<div className="pt-2 text-[11px] leading-relaxed text-subtle">{snapshotMeta.safety}</div>
```

Keep safety rules in `AGENTS.md`, docs, and skills instead of rendering them in the UI.

**Step 4: Remove or rewrite other slop-prone copy**

Replace these strings:

| Current | Replacement |
| --- | --- |
| `Primeira fase mostra fontes; valores reais entram após instrumentação.` | `No spend estimate until token usage is instrumented.` |
| `A entrega atual é layout público; as próximas fases adicionam coleta viva e custo real.` | `Implementation stages for live collection and cost rollups.` |
| `Pronto para a fase de coleta viva` | `Next collector target` |
| `O harness já define as regras de coleta segura...` | `Generate a sanitized JSON snapshot on a timer, then render historical trends from that file.` |
| `Baisync-like UI harness` | `Dashboard design system` |
| `Tokens e regras visuais versionadas...` | `Versioned layout rules for consistent monitoring screens.` |

**Step 5: Clean snapshot metadata**

In `lib/openclaw-snapshot.ts`, remove the `safety` field from `snapshotMeta` if no longer used:

```ts
export const snapshotMeta = {
  collectedAt: "2026-07-01T09:40:11-03:00",
  serverIp: "54.175.2.242",
  host: "ip-172-26-11-186",
  openclawVersion: "OpenClaw 2026.5.22 (a374c3a)",
  nodeVersion: "v22.22.2",
  npmVersion: "10.9.7",
};
```

**Step 6: Verify**

Run:

```bash
yarn lint
yarn typecheck
yarn build
```

Expected: pass.

**Step 7: Commit**

```bash
git add components/dashboard/dashboard-shell.tsx lib/openclaw-snapshot.ts
git commit -m "refactor: tighten dashboard copy"
```

---

### Task 10: Rework sidebar nav into operational sections

**Objective:** Make the sidebar read like the Baisync dashboard but with OpenClaw operational destinations.

**Files:**

- Modify: `components/dashboard/dashboard-shell.tsx`
- Modify: `lib/openclaw-snapshot.ts`

**Step 1: Replace nav model**

In `lib/openclaw-snapshot.ts`, replace `navSections` with a flat or grouped nav that includes icons and stable anchors.

Recommended:

```ts
export const navItems = [
  { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
  { label: "Logs", href: "#logs", icon: ScrollText },
  { label: "Agentes", href: "#agentes", icon: Bot },
  { label: "Gateway", href: "#gateway", icon: HeartPulse },
  { label: "Crons", href: "#crons", icon: Clock3 },
  { label: "Custos", href: "#custos", icon: CircleDollarSign },
  { label: "Plano", href: "#plano", icon: ListChecks },
];
```

If importing icon components into `lib/openclaw-snapshot.ts` feels too UI-specific, keep only strings there and define the icon mapping in `components/dashboard/dashboard-shell.tsx`.

**Step 2: Rename overview section anchor**

In `components/dashboard/dashboard-shell.tsx`, change:

```tsx
<section id="overview" className="space-y-6">
```

To:

```tsx
<section id="dashboard" className="space-y-6">
```

**Step 3: Update `Sidebar`**

Render `navItems` instead of `navSections`.

Use a Baisync-like structure:

```tsx
<nav className="flex-1 overflow-y-auto px-3 py-4">
  <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-subtle" style={mono}>
    Monitoramento
  </p>
  <ul className="space-y-1">
    {navItems.map((item, idx) => {
      const Icon = item.icon;
      return (
        <li key={item.label}>
          <a
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 text-[12px] transition-all ${
              idx === 0
                ? "sidebar-item-active"
                : "rounded-[10px] text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[rgba(255,255,255,0.88)]"
            }`}
            style={mono}
          >
            <Icon size={14} className="opacity-70" />
            {item.label}
          </a>
        </li>
      );
    })}
  </ul>
</nav>
```

**Step 4: Verify all anchors exist**

Ensure the page contains:

```tsx
<section id="dashboard" ...>
<section id="logs" ...>
<section id="agentes" ...>
<section id="gateway" ...>
<section id="crons" ...>
<Card id="custos" ...>
<section id="plano" ...>
```

**Step 5: Verify**

Run:

```bash
yarn lint
yarn typecheck
yarn build
```

Expected: pass.

**Step 6: Commit**

```bash
git add components/dashboard/dashboard-shell.tsx lib/openclaw-snapshot.ts
git commit -m "refactor: simplify dashboard sidebar navigation"
```

---

### Task 11: Update UI design skill in English with HeroUI and anti-slop rules

**Objective:** Make `.agents/skills/ui-design/SKILL.md` the source of truth for HeroUI usage and non-generic design.

**Files:**

- Modify: `.agents/skills/ui-design/SKILL.md`

**Step 1: Keep frontmatter English**

Keep the existing frontmatter, but update the description if desired:

```yaml
description: Use when editing the OpenClaw Observability Dashboard UI. Enforces HeroUI-first component selection, Baisync-inspired operational layout, precise copy, Tailwind v4 tokens, accessibility, and anti-AI-slop design standards.
```

**Step 2: Replace `Components` section**

Replace the current section with:

```markdown
## HeroUI-First Components

Use HeroUI v3 for interactive and structural UI whenever it has a matching component:

- `Card` for panels and metric cards.
- `Button` for actions, including login/logout and toolbar controls.
- `Input` / `Form` for authentication and future filters.
- `Chip` for compact statuses when it reads better than a custom pill.
- `Table` for dense tabular data when the dashboard grows beyond simple grids.
- `Divider`, `Tooltip`, `Tabs`, `Modal`, and `Drawer` when those patterns are needed.

Before implementing a HeroUI component, fetch the current docs:

- Component index: https://heroui.com/docs/react/components
- Component MDX pattern: `https://heroui.com/docs/react/components/{component-name}.mdx`

Examples:

- https://heroui.com/docs/react/components/card.mdx
- https://heroui.com/docs/react/components/button.mdx
- https://heroui.com/docs/react/components/input.mdx
- https://heroui.com/docs/react/components/form.mdx
- https://heroui.com/docs/react/components/chip.mdx

HeroUI v3 rules:

- Do not use `HeroUIProvider`.
- Prefer compound APIs when the docs show them, e.g. `Card.Header`, `Card.Content`.
- Use HeroUI event props such as `onPress` when the component docs require them.
- Keep custom CSS for layout tokens, Baisync-like shell, and dashboard-specific visual polish; do not recreate HeroUI primitives by hand when a component exists.
```

**Step 3: Add OpenAI instruction-writing guidance**

Add:

```markdown
## Instruction-Writing Rules for Skills and UI Copy

OpenAI's GPT instruction guidance recommends explicit step structures, clear delimiters, positive concrete instructions, and examples when classifications matter. Apply that here:

- Write instructions as `When X happens → do Y` where possible.
- Prefer concrete actions over vague taste words.
- Include acceptable/unacceptable examples for "AI slop" decisions.
- Keep safety rules in docs/skills and operational labels in the UI.
- Do not solve weak instructions by adding more UI chrome; tighten the rule first.

Reference: https://help.openai.com/en/articles/9358033-key-guidelines-for-writing-instructions-for-custom-gpts
```

**Step 4: Add anti-AI-slop design section**

Add:

```markdown
## Anti-AI-Slop Design Rules

The dashboard should look like an operator console, not a generic AI-generated SaaS page.

Do:

- Use exact operational nouns: `Gateway`, `Crons`, `Logs`, `Agentes`, `Custos`.
- Show measured values, timestamps, file sizes, counters, and states.
- Use short labels and leave explanation to docs or tooltips.
- Keep density high enough for monitoring work.
- Use subdued orange accent only for active/primary signals.

Avoid:

- Decorative safety badges such as "no secrets / no PII" in the product UI.
- Phrases like `Command Center`, `AI-powered`, `seamless`, `optimize`, `unlock`, `revolutionary`, `mission control` unless they are real product terminology.
- Fake metrics, arbitrary percentages, ungrounded costs, and placeholder success claims.
- Overusing glows, gradients, decorative icons, and empty cards.
- Explaining implementation hygiene in the hero area.

Acceptable copy:

```text
Gateway, jobs, agents, cost instrumentation, and sanitized log counters from the OpenClaw VPS inventory.
```

Unacceptable copy:

```text
Secure AI-powered command center with no secrets, no PII, and seamless operational intelligence.
```
```

**Step 5: Update verification checklist**

Add checks:

```markdown
- [ ] HeroUI docs were checked for any component added or changed.
- [ ] No hero badge or decorative copy claims basic hygiene such as "no secrets".
- [ ] Sidebar labels are operational and match real page anchors.
- [ ] Browser/Playwright verification was run after UI changes.
```

**Step 6: Commit**

```bash
git add .agents/skills/ui-design/SKILL.md
git commit -m "docs: strengthen dashboard design skill"
```

---

### Task 12: Update OpenClaw observability skill in English

**Objective:** Keep the data/ops skill English and add concrete API/auth/deploy safety guidance.

**Files:**

- Modify: `.agents/skills/openclaw-observability/SKILL.md`

**Step 1: Add auth-safe data rule**

Add to the forbidden output section:

```markdown
- `.env` contents, dashboard password, auth secret, or signed session cookie values.
```

**Step 2: Add public dashboard route rules**

Add:

```markdown
## Public Dashboard Rules

- The public dashboard may expose aggregate operational state, but not raw operational artifacts.
- Authentication must protect `/` unless the user explicitly asks for a public unauthenticated view.
- `/login` may be public.
- Login credentials must come from `.env`; never hardcode them in TypeScript, docs, tests, or screenshots.
- Use `.env.example` only for placeholders.
```

**Step 3: Add collector rule for future phase**

Add:

```markdown
## Live Collector Rule

When adding live data, generate a sanitized JSON file on a timer. Do not run SSH, journal, docker, or filesystem probes during a public HTTP request. Public route handlers should read already-sanitized data only.
```

**Step 4: Commit**

```bash
git add .agents/skills/openclaw-observability/SKILL.md
git commit -m "docs: update observability skill for auth"
```

---

### Task 13: Rewrite AGENTS.md with Yarn, HeroUI, browser and verification gates

**Objective:** Make AGENTS.md a clear English harness for future agents and include exact validation metrics.

**Files:**

- Modify: `AGENTS.md`

**Step 1: Replace content**

Use this structure:

```markdown
# OpenClaw Dashboard Harness

This repository contains the OpenClaw observability dashboard built with Next.js, Tailwind CSS v4, and HeroUI v3.

## Required Reading Before Editing

1. Before changing UI files (`app/**/*.tsx`, `components/**/*.tsx`, `app/globals.css`), read `.agents/skills/ui-design/SKILL.md`.
2. Before changing data collection, auth, API routes, deployment, Nginx, or systemd files, read `.agents/skills/openclaw-observability/SKILL.md`.
3. Before using or changing HeroUI components, check the current HeroUI docs: https://heroui.com/docs/react/components.

## Package Manager

Use Yarn, not npm.

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install --frozen-lockfile
```

Do not commit `package-lock.json`.

## Local Development

```bash
cp .env.example .env
# edit .env with real local values
yarn dev --hostname 127.0.0.1 --port 3100
```

## Required Verification Before Commit

Run all applicable checks:

```bash
yarn audit --level moderate
yarn lint
yarn typecheck
yarn test
yarn build
```

Expected:

- audit: no moderate/high vulnerabilities
- lint: zero errors
- typecheck: zero errors
- test: Playwright passes in Chromium
- build: Next.js production build succeeds

## Browser Verification

Use Playwright or the browser tool after UI/auth changes.

Minimum browser checks:

1. Open `/` without a cookie; expect redirect to `/login`.
2. Submit wrong credentials; expect visible error.
3. Submit valid credentials from `.env`; expect dashboard.
4. Verify sidebar links: `Dashboard`, `Logs`, `Agentes`, `Gateway`, `Crons`, `Custos`, `Plano`.
5. Click logout; expect return to `/login`.

## Production Verification

On the VPS:

```bash
systemctl --user is-active openclaw-observability-dashboard.service
systemctl is-active nginx
curl -sS http://127.0.0.1:3100/ -I
curl -sS http://127.0.0.1/healthz
curl -sS http://54.175.2.242/ -I
```

## Security Rules

- Never commit `.env` or real credentials.
- Never render raw OpenClaw logs, Slack/WhatsApp payloads, patient/clinic data, tokens, OTPs, or cookies.
- Keep the OpenClaw gateway on loopback; do not expose `127.0.0.1:18789` publicly.
- Public route handlers should read sanitized data only.
```

**Step 2: Verify Markdown only**

No code verification needed for markdown-only task, but run:

```bash
git diff -- AGENTS.md
```

**Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update agent verification gates"
```

---

### Task 14: Add CLAUDE.md forwarding file

**Objective:** Make Claude-style agents load the same root instructions.

**Files:**

- Create: `CLAUDE.md`

**Step 1: Create file**

`CLAUDE.md` must contain only:

```markdown
@AGENTS.md
```

No extra blank sections.

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add claude agent pointer"
```

---

### Task 15: Add proprietary license

**Objective:** Make ownership/license status explicit.

**Files:**

- Create: `LICENSE`

**Step 1: Create `LICENSE`**

Use:

```text
Proprietary License

Copyright (c) 2026 TechCeo. All rights reserved.

This software and associated documentation files (the "Software") are proprietary and confidential. Unauthorized copying, modification, distribution, sublicensing, or use of the Software, in whole or in part, is strictly prohibited without prior written permission from the copyright holder.

The Software is provided for internal operational use only. No rights are granted except those expressly authorized in writing by the copyright holder.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

**Open question:** confirm the legal owner name. If the owner should be a different entity/person, update the copyright line before final deployment.

**Step 2: Commit**

```bash
git add LICENSE
git commit -m "docs: add proprietary license"
```

---

### Task 16: Rewrite README for Yarn, auth, deployment and validation

**Objective:** Make README accurate for the new authenticated Yarn-based app.

**Files:**

- Modify: `README.md`

**Step 1: Rewrite README**

Use this outline:

```markdown
# OpenClaw Observability Dashboard

Operational dashboard for OpenClaw gateway health, jobs, agents, cost instrumentation, and sanitized log counters.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- HeroUI v3
- Playwright
- Yarn 1.22 via Corepack

## Setup

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install --frozen-lockfile
cp .env.example .env
```

Edit `.env`:

```dotenv
DASHBOARD_AUTH_USER=...
DASHBOARD_AUTH_PASSWORD=...
AUTH_SECRET=...
```

## Development

```bash
yarn dev --hostname 127.0.0.1 --port 3100
```

Open `http://127.0.0.1:3100/login`.

## Verification

```bash
yarn audit --level moderate
yarn lint
yarn typecheck
yarn test
yarn build
```

## Deploy

- App path on VPS: `/home/ubuntu/openclaw-observability-dashboard`
- User service: `openclaw-observability-dashboard.service`
- Local Next.js bind: `127.0.0.1:3100`
- Public Nginx: `http://54.175.2.242/`
- Healthcheck: `http://54.175.2.242/healthz`

## Security

- `.env` is not committed.
- `/` is protected by a signed HTTP-only cookie.
- OpenClaw gateway remains private on loopback.
- Public UI must render sanitized aggregate data only.

## Agent Harness

- `AGENTS.md`
- `CLAUDE.md`
- `.agents/skills/ui-design/SKILL.md`
- `.agents/skills/openclaw-observability/SKILL.md`
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: refresh readme for auth and yarn"
```

---

### Task 17: Add project plan under docs

**Objective:** Satisfy the requested project plan in the docs folder.

**Files:**

- Create: `docs/project-plan.md`

**Step 1: Create plan doc**

Use a concise project plan derived from this implementation plan:

```markdown
# OpenClaw Observability Dashboard Project Plan

## Goal

Build an authenticated operational dashboard for OpenClaw gateway health, crons, agents, logs, and cost instrumentation.

## Current Phase

Phase 1: layout, auth, documentation, and verification harness.

## Architecture

- Next.js App Router behind Nginx.
- Signed HTTP-only cookie auth from `.env` credentials.
- Sanitized static snapshot now; live collector later.
- HeroUI-first dashboard components with Baisync-inspired visual system.

## Milestones

1. Clean dashboard UI copy and sidebar.
2. Add login/logout and protected root route.
3. Standardize on Yarn.
4. Add Playwright browser verification.
5. Update agent skills, AGENTS.md, README, CLAUDE.md, and license.
6. Later: add scheduled sanitized JSON collector.
7. Later: add token/cost rollups from real usage data.

## Validation

Required before each deploy:

```bash
yarn audit --level moderate
yarn lint
yarn typecheck
yarn test
yarn build
```

Browser validation must cover login, logout, dashboard render, and sidebar anchors.
```

**Step 2: Commit**

```bash
git add docs/project-plan.md
git commit -m "docs: add project plan"
```

---

### Task 18: Add Playwright config and auth tests

**Objective:** Provide the browser verification metrics requested in AGENTS.md.

**Files:**

- Create: `playwright.config.ts`
- Create: `tests/e2e/auth.spec.ts`

**Step 1: Create Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "DASHBOARD_AUTH_USER=admin DASHBOARD_AUTH_PASSWORD=admin AUTH_SECRET=test-secret yarn dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

**Step 2: Create E2E test**

Create `tests/e2e/auth.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("protects the dashboard and supports login/logout", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByTestId("login-username").fill("admin");
  await page.getByTestId("login-password").fill("wrong-password");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("login-error")).toContainText("Usuário ou senha inválidos");

  await page.getByTestId("login-password").fill("admin");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /OpenClaw observability/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Logs/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Agentes/i })).toBeVisible();

  await page.getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);
});
```

**Step 3: Install browser if needed**

Run only if Chromium is not available:

```bash
yarn playwright install chromium
```

On servers needing system dependencies, use:

```bash
yarn playwright install --with-deps chromium
```

**Step 4: Verify**

Run:

```bash
yarn test
```

Expected: one Chromium test passes.

**Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/auth.spec.ts
git commit -m "test: add dashboard auth e2e coverage"
```

---

### Task 19: Update deploy templates to use Yarn and `.env`

**Objective:** Make production service match Yarn and auth requirements.

**Files:**

- Modify: `deploy/systemd/openclaw-observability-dashboard.service`
- Verify: `deploy/nginx/openclaw-observability-dashboard.conf`

**Step 1: Update systemd template**

Replace `deploy/systemd/openclaw-observability-dashboard.service` with:

```ini
[Unit]
Description=OpenClaw Observability Dashboard (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/ubuntu/openclaw-observability-dashboard
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=PORT=3100
EnvironmentFile=-/home/ubuntu/openclaw-observability-dashboard/.env
ExecStart=/usr/bin/bash -lc 'corepack yarn start --hostname 127.0.0.1 --port 3100'
Restart=always
RestartSec=5
KillMode=control-group
TimeoutStopSec=20

[Install]
WantedBy=default.target
```

**Step 2: Verify Nginx template**

Ensure `deploy/nginx/openclaw-observability-dashboard.conf` still includes:

```nginx
server_name 54.175.2.242 _;
proxy_pass http://127.0.0.1:3100;
```

No need to change Nginx unless auth adds new route requirements. `/healthz` remains served by Nginx and does not require dashboard auth.

**Step 3: Commit**

```bash
git add deploy/systemd/openclaw-observability-dashboard.service deploy/nginx/openclaw-observability-dashboard.conf
git commit -m "chore: update deployment templates for yarn auth"
```

---

### Task 20: Run full local verification

**Objective:** Prove the complete implementation works before deployment.

**Files:** none

**Step 1: Run checks**

Run:

```bash
cd /root/work/openclaw-observability-dashboard
yarn audit --level moderate
yarn lint
yarn typecheck
yarn test
yarn build
```

Expected:

- audit: no moderate/high vulnerabilities
- lint: pass
- typecheck: pass
- test: Playwright auth test passes
- build: pass

**Step 2: Verify page source does not expose secrets**

Run with local test credentials:

```bash
DASHBOARD_AUTH_USER=admin DASHBOARD_AUTH_PASSWORD=admin AUTH_SECRET=test-secret yarn start --hostname 127.0.0.1 --port 3100
```

In a second shell:

```bash
curl -sS http://127.0.0.1:3100/login | grep -Ei "AUTH_SECRET|DASHBOARD_AUTH_PASSWORD|test-secret|admin" && echo "LEAK" || echo "OK"
```

Expected:

```text
OK
```

Stop the local server after verification.

**Step 3: Commit if build metadata changed**

Do not commit `.next`, `test-results`, `playwright-report`, or `tsconfig.tsbuildinfo`. Add those to `.gitignore` if they appear.

---

### Task 21: Deploy to VPS using Yarn and server `.env`

**Objective:** Publish the authenticated dashboard without printing credentials.

**Files:**

- Remote-only create/update: `/home/ubuntu/openclaw-observability-dashboard/.env`
- Remote update: `/home/ubuntu/.config/systemd/user/openclaw-observability-dashboard.service`

**Step 1: Sync code**

Run from local Hermes host:

```bash
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude tsconfig.tsbuildinfo \
  --exclude .env \
  /root/work/openclaw-observability-dashboard/ \
  openclaw-lightsail-fixed:/home/ubuntu/openclaw-observability-dashboard/
```

**Step 2: Create remote `.env` without printing secrets**

Use a non-echoing method. Example interactive-safe pattern:

```bash
ssh openclaw-lightsail-fixed 'cd /home/ubuntu/openclaw-observability-dashboard && umask 077 && test -f .env || cp .env.example .env && ls -l .env'
```

Then edit `.env` via a secure method approved by the operator. Do not paste actual values into chat or commit them.

Required values:

```dotenv
DASHBOARD_AUTH_USER=<real-user>
DASHBOARD_AUTH_PASSWORD=<real-password>
AUTH_SECRET=<random-long-secret>
```

Generate secret on the VPS if needed:

```bash
ssh openclaw-lightsail-fixed 'openssl rand -base64 48'
```

Do not paste the generated value in chat.

**Step 3: Install and build with Yarn**

Run:

```bash
ssh openclaw-lightsail-fixed '
  set -euo pipefail
  cd /home/ubuntu/openclaw-observability-dashboard
  corepack enable
  corepack prepare yarn@1.22.22 --activate
  yarn install --frozen-lockfile
  yarn audit --level moderate
  yarn lint
  yarn typecheck
  yarn build
'
```

Expected: all pass.

**Step 4: Install updated systemd unit**

Run:

```bash
ssh openclaw-lightsail-fixed '
  set -euo pipefail
  cp /home/ubuntu/openclaw-observability-dashboard/deploy/systemd/openclaw-observability-dashboard.service ~/.config/systemd/user/openclaw-observability-dashboard.service
  systemctl --user daemon-reload
  systemctl --user enable --now openclaw-observability-dashboard.service
  systemctl --user restart openclaw-observability-dashboard.service
  sleep 2
  systemctl --user is-active openclaw-observability-dashboard.service
'
```

Expected:

```text
active
```

**Step 5: Nginx remains the same unless drift exists**

Verify:

```bash
ssh openclaw-lightsail-fixed '
  sudo nginx -t
  systemctl is-active nginx
  curl -sS http://127.0.0.1/healthz
'
```

Expected:

```text
nginx: configuration file ... test is successful
active
openclaw-observability-dashboard ok
```

---

### Task 22: Public/browser verification after deploy

**Objective:** Verify the authenticated public dashboard via HTTP and browser automation.

**Files:** none

**Step 1: Verify unauthenticated redirect**

Run:

```bash
curl -sS -I http://54.175.2.242/ | sed -n '1,12p'
```

Expected: either `307`/`308` redirect to `/login` or an HTTP response that indicates Next redirect behavior. If Nginx follows differently, verify through browser/Playwright.

**Step 2: Verify login page public access**

Run:

```bash
curl -sS -I http://54.175.2.242/login | sed -n '1,12p'
```

Expected: `HTTP/1.1 200 OK`.

**Step 3: Verify healthcheck remains public**

Run:

```bash
curl -sS http://54.175.2.242/healthz
```

Expected:

```text
openclaw-observability-dashboard ok
```

**Step 4: Browser verification**

Use Playwright or Hermes browser tools:

- Visit `http://54.175.2.242/` in a clean session.
- Confirm redirect to `/login`.
- Login using server `.env` credentials.
- Confirm dashboard renders.
- Confirm sidebar contains `Dashboard`, `Logs`, `Agentes`, `Gateway`, `Crons`, `Custos`, `Plano`.
- Confirm the removed string does not appear:

```text
sem segredos · sem PII · sem logs brutos
```

**Step 5: Final status checks**

Run:

```bash
ssh openclaw-lightsail-fixed '
  systemctl --user is-active openclaw-observability-dashboard.service
  systemctl is-active nginx
  ss -lntp | grep -E "(:80|:3100|:18789)" || true
'
```

Expected:

- dashboard service active
- Nginx active
- `127.0.0.1:3100` for Next
- `0.0.0.0:80` for Nginx
- OpenClaw gateway still loopback on `127.0.0.1:18789`

---

## Files Likely to Change

```text
.env.example
.gitignore
AGENTS.md
CLAUDE.md
LICENSE
README.md
package.json
yarn.lock
playwright.config.ts
app/page.tsx
app/login/page.tsx
app/api/auth/login/route.ts
app/api/auth/logout/route.ts
components/dashboard/dashboard-shell.tsx
lib/auth.ts
lib/openclaw-snapshot.ts
.agents/skills/ui-design/SKILL.md
.agents/skills/openclaw-observability/SKILL.md
docs/project-plan.md
deploy/systemd/openclaw-observability-dashboard.service
tests/e2e/auth.spec.ts
```

Files likely to delete:

```text
package-lock.json
```

Files that must **not** be committed:

```text
.env
.env.* except .env.example
.next/
node_modules/
test-results/
playwright-report/
tsconfig.tsbuildinfo
```

If Playwright creates `test-results/` or `playwright-report/`, add them to `.gitignore`:

```gitignore
test-results/
playwright-report/
```

---

## Tests / Validation Summary

Local required commands:

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install --frozen-lockfile
yarn audit --level moderate
yarn lint
yarn typecheck
yarn test
yarn build
```

Runtime browser checks:

```text
/ redirects to /login without cookie
/login renders
wrong credentials show an error
valid credentials render dashboard
logout returns to /login
sidebar links are present and point to existing anchors
removed AI-slop copy is absent from HTML/page text
```

Deployment checks:

```bash
systemctl --user is-active openclaw-observability-dashboard.service
systemctl is-active nginx
curl -sS http://127.0.0.1/healthz
curl -sS -I http://54.175.2.242/login
curl -sS -I http://54.175.2.242/
```

Security checks:

```bash
git grep -nE "AUTH_SECRET|DASHBOARD_AUTH_PASSWORD|openclaw_dashboard_session|sem segredos|sem PII|logs brutos"
```

Expected:

- `AUTH_SECRET` and `DASHBOARD_AUTH_PASSWORD` appear only in `.env.example`, auth code variable names, docs, and tests with placeholder/test values.
- No real secrets appear.
- Removed UI phrase is absent from runtime UI files.

---

## Risks, Tradeoffs, and Open Questions

### Risks

1. **Yarn audit behavior:** Yarn Classic audit can report advisories differently from npm. If it flags `next/postcss` despite the existing override/resolution, update `resolutions` carefully and re-run build.
2. **Systemd + Corepack path:** `corepack yarn` must be available in the user service environment. If not, install/activate Corepack for the `ubuntu` user or use the absolute Yarn shim path discovered by `command -v yarn`.
3. **Build without env:** The auth code should read env only at request/login time. If `next build` requires env unexpectedly, set safe test env vars for build commands and document them.
4. **Cookie auth is intentionally simple:** It is acceptable for a single-operator dashboard but does not include rate limiting, password rotation workflow, MFA, lockout, or user management.
5. **Public HTTP:** Current deployment uses HTTP on port 80. If credentials will be typed over the public internet, add TLS before relying on the login outside a trusted network.
6. **Proprietary license owner:** The plan uses `TechCeo` as the proposed owner. Confirm before final legal use.

### Tradeoffs

- Signed cookie avoids adding a JWT dependency and keeps YAGNI discipline.
- Keeping Nginx `/healthz` public avoids auth complexity for health checks.
- Keeping dashboard data static in this task avoids mixing UI/auth cleanup with live collector work.
- Moving the dashboard into `components/dashboard/dashboard-shell.tsx` makes auth clean but creates one large component file; later refactor can split panels into smaller files.

### Open Questions

1. What exact username/password should be placed in the VPS `.env`? Do not commit or paste them in chat.
2. Should public access remain plain HTTP, or should TLS be added now?
3. Should the proprietary license owner be `TechCeo`, another company, or a person?
4. Should the dashboard UI remain Portuguese, or should operational labels become fully English? This plan keeps requested labels like `Agentes` and Portuguese login error text while making skills/docs English where requested.

---

## Implementation Handoff

Plan complete. Execute with `subagent-driven-development` task-by-task. After each task, run the specified verification and commit before moving on.
