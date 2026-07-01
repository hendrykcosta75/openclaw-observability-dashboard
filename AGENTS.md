# OpenClaw Dashboard Harness

Este repo é um harness local para construir o dashboard de observabilidade do OpenClaw com Next.js, Tailwind CSS v4 e HeroUI v3.

## Regras obrigatórias antes de editar

1. Antes de editar qualquer `.tsx`, `.ts` ou `.css`, leia `.agents/skills/ui-design/SKILL.md`.
2. Antes de adicionar coleta de dados, API routes, scripts, systemd ou Nginx, leia `.agents/skills/openclaw-observability/SKILL.md`.
3. Nunca commitar tokens, chaves, `~/.openclaw/openclaw.json`, `.env`, payloads Slack/WhatsApp, dados de pacientes/clínicas, OTPs, URLs privadas ou logs brutos.
4. O dashboard público deve mostrar somente dados sanitizados, agregados e operacionais.

## Stack e comandos

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

## Design baseline

O layout segue o dashboard do Baisync:

- fundo `bg-app` escuro com orbs laranja sutis;
- sidebar esquerda translúcida/glass com itens mono e ativo neumorphic;
- header fixo translúcido;
- cartões `glass-card` com borda fina, brilho interno e hover leve;
- botões `btn-neu` / `btn-neu-ghost`; evite botões genéricos no dashboard;
- tipografia mono para títulos, labels e números operacionais.

## Próxima fase técnica

A primeira fase é layout + snapshot estático. A próxima fase deve adicionar um coletor local sanitizado que gera JSON para o Next.js sem expor segredos.
