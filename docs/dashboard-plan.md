# Plano do dashboard OpenClaw

## Objetivo

Criar um painel web autenticado para acompanhar saúde operacional do OpenClaw: custos, crons, agentes, gateway, erros e logs.

## Fase 1 — Layout e harness (feito nesta primeira entrega)

- Criar app Next.js/Tailwind/HeroUI.
- Reproduzir o layout do dashboard Baisync: sidebar, header, cartões glass, accent laranja e mono labels.
- Registrar harness com `AGENTS.md` e skills locais.
- Criar snapshot sanitizado do OpenClaw no código.
- Rodar build/start local no VPS e publicar via Nginx.

## Fase 2 — Coletor sanitizado

- Transformar o inventário em `scripts/collect-openclaw-snapshot.py` com saída JSON.
- Agendar coleta via systemd timer ou cron leve.
- Expor o JSON ao Next.js por leitura local/route handler sem executar comandos por request.
- Adicionar histórico diário de resource usage, crons, erros e jobs deferidos.

## Fase 3 — Custos

- Descobrir fonte confiável de tokens por execução OpenClaw/Codex.
- Criar mapa de preços por provider/model em config sanitizada.
- Agregar custo por agente, fluxo, workspace e dia.
- Adicionar AWS Cost Explorer para Lightsail se credencial/escopo estiverem disponíveis.
- Exibir `estimado` vs `real` explicitamente.

## Fase 4 — Alertas e drill-down seguro

- Cards de incidentes: gateway RSS/tasks, timers atrasados, crons deferidos, journal warnings, MCP transport failures.
- Drill-down com apenas metadados agregados; raw logs ficam fora do dashboard.
- Links operacionais para playbooks/skills, não para arquivos sensíveis.

## Critérios de segurança

- O dashboard autenticado nunca mostra payloads, nomes, telefones, tokens ou URLs privadas.
- OpenClaw gateway continua apenas em loopback.
- Nginx publica somente o dashboard.
