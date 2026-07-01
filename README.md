# OpenClaw Observability Dashboard

Primeiro layout do painel de monitoramento do OpenClaw, baseado no layout do dashboard do Baisync: sidebar escura, header translúcido, cartões glass/neumorphic, acento laranja e tipografia mono.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- HeroUI v3 (`@heroui/react` + `@heroui/styles`)
- Lucide icons
- Recharts preparado para a próxima fase de métricas reais

## Comandos

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3100
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

## Harness de agentes

- `AGENTS.md` é o contrato principal para qualquer agente trabalhar neste repo.
- `.agents/skills/ui-design/SKILL.md` mantém o design system Baisync-like.
- `.agents/skills/openclaw-observability/SKILL.md` mantém regras de coleta segura de dados do OpenClaw.
- `docs/openclaw-inventory.md` registra o inventário sanitizado coletado no VPS.
- `docs/dashboard-plan.md` detalha o plano em fases do dashboard.

## Segurança

Este layout usa um snapshot sanitizado em `lib/openclaw-snapshot.ts`. Ele não inclui tokens, chaves, payloads Slack/WhatsApp, URLs privadas, nomes de pacientes/clínicas, OTPs ou conteúdo bruto de logs.
