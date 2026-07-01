---
name: ui-design
description: Use before editing OpenClaw dashboard UI. Enforces HeroUI v3 usage, Baisync-inspired visual language, operational copy, anti-AI-slop standards, and browser validation.
version: 1.2.0
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

When changing prompt/copy/design instructions, use OpenAI's instruction-writing guidance as the reference model:

- Prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering
- Help Center best practices: https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api

Apply the same principles to UI copy: put the instruction/purpose first, separate context from output, be specific about format and style, show acceptable examples, and avoid fluffy or imprecise descriptions.

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
- Sidebar labels should be operational and short: `Dashboard`, `Logs`, `Agentes`, `Gateway`, `Crons`, `Custos`.
- Header must follow the Baisync dashboard header pattern: 56px high, sticky top, translucent black, no visible status chips, left mobile menu toggle plus `Painel` gradient label, and only two compact right-side actions: notifications and profile.
- On mobile, the sidebar must use the Baisync drawer pattern: hamburger button in the header, fixed left drawer, black translucent backdrop, `z-50` sidebar over `z-40` overlay, and close on backdrop/nav click.
- Content: `max-w-7xl`, `p-5 lg:p-6`, dense grids.
- Decorative orbs must be subtle and non-interactive.

## Status Presentation Rules

- Do not use visible status pills/chips/badges for dashboard health states.
- Never render copy such as `Gateway 200`, `OK`, `Atenção`, `Crítico`, or similar status words as pill labels.
- Use compact card-corner icons plus concrete body text for state.
- If state needs to be named, place it as normal row text (`running`, `loopback`, `sem falhas`) rather than a colored badge.
- Keep the most important operational data first: token/cost collection, configured agents, gateway health, errors, then lower-level resource counters.

## Anti-AI-Slop Copy Standards

Use OpenAI-style instruction discipline for copy and skills: concrete positive instructions, explicit structure, examples, and realistic high-value outputs.

### Do

- Use source-backed, operational labels: `Tokens`, `Agentes`, `Gateway`, `Erros 24h`, `Tasks 257 / 1200`.
- Explain missing data plainly: `Tokens not instrumented yet`.
- Prefer nouns and verbs over hype: `Crons ativos`, `Uso ao Longo do Tempo`, `Agentes configurados`.
- Keep safety and privacy rules in docs/skills, not as virtue-signaling badges in the UI.
- Make every card answer: what is this, current state, where did it come from?

### Do Not

- Do not use generic SaaS/AI phrases: `Command Center`, `AI-powered`, `seamless`, `unlock insights`, `sem segredos`, `sem PII`, `sem logs brutos`.
- Do not add fake precision or invented charts.
- Do not add floating marketing badges to technical dashboards.
- Do not add status-pill decoration to compensate for weak hierarchy.
- Do not overuse gradients, sparkles, oversized hero sections, or empty slogans.

### Acceptable vs. Unacceptable

Acceptable:

```text
Gateway
Ativo
Endpoint de health respondeu em loopback
```

Unacceptable:

```text
AI-powered command center with secure insights and no secrets
Gateway 200   OK   Atenção
```

## Verification Checklist

- [ ] Relevant HeroUI docs were checked for changed components.
- [ ] UI uses HeroUI v3 patterns and compiles with TypeScript.
- [ ] Sidebar contains the operational navigation items.
- [ ] Header matches Baisync: `Painel` on the left, notification icon and profile icon on the right, no gateway/IP/logout/status chips.
- [ ] Cards use small top-right icons for state; no visible `Gateway 200`, `OK`, or `Atenção` chips.
- [ ] No AI-slop badge/copy was introduced.
- [ ] `yarn lint`, `yarn typecheck`, `yarn build`, and Playwright pass.
- [ ] Browser verification confirms login, dashboard rendering, and logout.
