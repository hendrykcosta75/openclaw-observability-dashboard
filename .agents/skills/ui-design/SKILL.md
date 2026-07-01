---
name: ui-design
description: Use before editing OpenClaw dashboard UI. Enforces HeroUI v3 usage, Baisync-inspired visual language, operational copy, anti-AI-slop standards, and browser validation.
version: 1.1.0
author: Hermes Agent
license: Proprietary
metadata:
  hermes:
    tags: [ui, design-system, baisync, tailwind, heroui, dashboard, anti-slop]
    related_skills: [openclaw-observability]
---

# UI Design System — OpenClaw Dashboard

## Purpose

Keep the dashboard looking like a real operations tool: dense, specific, restrained, and verifiable. The visual baseline is the Baisync dashboard: dark surfaces, orange accent, glass/neumorphic cards, mono labels, and a left sidebar.

## Required Documentation Lookup

Before adding or changing a HeroUI component, open the relevant HeroUI v3 docs:

- Components index: https://heroui.com/docs/react/components
- Direct component docs: `https://heroui.com/docs/react/components/{component-name}.mdx`
- Common components:
  - Card: https://heroui.com/docs/react/components/card.mdx
  - Button: https://heroui.com/docs/react/components/button.mdx
  - Input: https://heroui.com/docs/react/components/input.mdx
  - Form: https://heroui.com/docs/react/components/form.mdx
  - Chip: https://heroui.com/docs/react/components/chip.mdx
  - Progress: https://heroui.com/docs/react/components/progress.mdx

Use HeroUI v3 patterns only. Do not use HeroUI v2 assumptions.

## Component Rules

- Prefer HeroUI components for interactive UI: `Button`, `Input`, `TextField`, `Form`, `Card`, `Chip`, `Progress`, modal/dialog components.
- Use compound component anatomy where HeroUI provides it: `Card.Header`, `Card.Content`, `Card.Title`, `Card.Description`.
- Do not add `HeroUIProvider`; v3 does not require it.
- Use `onPress` for HeroUI buttons.
- Icons go inside HeroUI buttons as children, not via unsupported props.
- Dashboard-specific visual classes (`btn-neu`, `glass-card`, `sidebar-item-active`) may be applied through `className` on HeroUI components.

## Visual Tokens

Use tokens and classes from `app/globals.css`:

- Surfaces: `bg-app`, `bg-surface`, `bg-raised`, `bg-overlay`, `bg-dim`
- Text: `text-heading`, `text-body`, `text-subtle`
- Borders: `border-border-dim`
- Accent: `text-gradient`, `glow-orange`, `glow-orange-strong`

Raw hex is allowed only for existing accent overrides or token definitions. Do not introduce new palettes.

## Typography

Use mono labels for operational UI:

```tsx
const mono = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } as const;
```

Apply it to headings, sidebar items, table headers, metric labels, IDs, timestamps, and operational numbers.

## Layout

- Fixed full-height shell: left sidebar + content column.
- Sidebar labels should be operational and short: `Dashboard`, `Logs`, `Agentes`, `Gateway`, `Crons`, `Custos`, `Plano`.
- Header height: 56px, sticky top, translucent black, right-aligned status/actions.
- Content: `max-w-7xl`, `p-5 lg:p-6`, dense grids.
- Decorative orbs must be subtle and non-interactive.

## Anti-AI-Slop Copy Standards

Use OpenAI-style instruction discipline for copy and skills: concrete positive instructions, explicit structure, examples, and realistic high-value outputs.

### Do

- Use source-backed, operational labels: `Gateway 200`, `Tasks 257 / 1200`, `Journal 24h`.
- Explain missing data plainly: `Tokens not instrumented yet`.
- Prefer nouns and verbs over hype: `Pipeline de coleta`, `Snapshot`, `Crons ativos`.
- Keep safety and privacy rules in docs/skills, not as virtue-signaling badges in the UI.
- Make every card answer: what is this, current state, where did it come from?

### Do Not

- Do not use generic SaaS/AI phrases: `Command Center`, `AI-powered`, `seamless`, `unlock insights`, `sem segredos`, `sem PII`, `sem logs brutos`.
- Do not add fake precision or invented charts.
- Do not add floating marketing badges to technical dashboards.
- Do not overuse gradients, sparkles, oversized hero sections, or empty slogans.

### Acceptable vs. Unacceptable

Acceptable:

```text
Gateway
Ativo
Health 200 em 127.0.0.1:18789
```

Unacceptable:

```text
AI-powered command center with secure insights and no secrets
```

## Verification Checklist

- [ ] Relevant HeroUI docs were checked for changed components.
- [ ] UI uses HeroUI v3 patterns and compiles with TypeScript.
- [ ] Sidebar contains the operational navigation items.
- [ ] No AI-slop badge/copy was introduced.
- [ ] `yarn lint`, `yarn typecheck`, `yarn build`, and Playwright pass.
- [ ] Browser verification confirms login, dashboard rendering, and logout.
