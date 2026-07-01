---
name: ui-design
description: Use when editing the OpenClaw Observability Dashboard UI. Enforces the Baisync-inspired dark dashboard design system, Tailwind v4 tokens, HeroUI v3 usage, typography, cards, buttons, charts, and accessibility rules.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [ui, design-system, baisync, tailwind, heroui, dashboard]
    related_skills: [openclaw-observability]
---

# UI Design System — OpenClaw Dashboard

## Overview

This skill preserves the visual language copied from the Baisync dashboard while adapting it to OpenClaw monitoring: dark operational console, orange accent, glass panels, neumorphic controls, dense-but-readable telemetry and mono labels.

## When to Use

Use before any change to:

- `app/**/*.tsx`
- `components/**/*.tsx`
- `app/globals.css`
- `lib/openclaw-snapshot.ts` when labels or display grouping change

## Visual Tokens

Use semantic Tailwind tokens from `app/globals.css` instead of ad-hoc colors:

- surfaces: `bg-app`, `bg-surface`, `bg-raised`, `bg-overlay`, `bg-dim`
- text: `text-heading`, `text-body`, `text-subtle`
- borders: `border-border-dim`
- brand: `text-gradient`, `glow-orange`, `glow-orange-strong`

Raw hex is allowed only inside CSS token definitions or SVG gradients.

## Typography

Operational labels and titles must use:

```tsx
const mono = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } as const;
```

Apply it inline to headings, stat labels, sidebar items and table headers. This mirrors the Baisync dashboard.

## Layout

- Fixed full-height app shell: sidebar + content column.
- Sidebar: translucent black, backdrop blur, active item with `.sidebar-item-active`.
- Header: 56px, sticky top, translucent black, right-aligned chips/actions.
- Content: `max-w-7xl`, padding `p-5 lg:p-6`, dense grids.
- Decorative orbs must be subtle and non-interactive.

## Components

- Use HeroUI v3 compound components when they help semantics, e.g. `Card`, `Card.Header`, `Card.Content`.
- No `HeroUIProvider`; HeroUI v3 does not need it.
- Avoid `framer-motion`; use CSS transitions.
- Dashboard buttons should be native `<button>`/`<a>` styled with `btn-neu` or `btn-neu-ghost`.

## Chart and Metrics Style

- Prefer compact cards with a label, large value and small explanation.
- Use orange for primary active signals; green/yellow/red only for health state.
- Use sparklines/progress rails with low-opacity grids and no fake precision.
- If a value is not instrumented yet, say `Instrumentar` or `Planejado`, not a fake number.

## Accessibility

- Text contrast must remain readable on dark surfaces.
- Hit targets: at least 40px for controls, 44px for mobile controls.
- Use semantic headings and `aria-label` for icon-only controls.
- Preserve focus rings with orange accent.

## Common Pitfalls

1. Creating generic SaaS cards with arbitrary fake metrics.
2. Mixing light Tailwind defaults into the dark console.
3. Using HeroUI v2 patterns such as `HeroUIProvider` or flat card props.
4. Printing or rendering raw operational logs or PII.
5. Replacing Baisync's dense mono dashboard posture with a marketing page.

## Verification Checklist

- [ ] CSS imports are ordered: Tailwind first, HeroUI styles second.
- [ ] Page uses the app shell: sidebar, header, content grid.
- [ ] Cards and buttons use the local design system classes.
- [ ] No secrets/PII/raw logs rendered.
- [ ] `npm run build` passes.
