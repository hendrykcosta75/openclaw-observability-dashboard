# OpenClaw Inventory — sanitized snapshot

Coletado em `2026-07-01T09:40:11-03:00` no host `ip-172-26-11-186` (`54.175.2.242`). Este documento contém somente metadados operacionais agregados.

## Runtime

| Item | Valor |
| --- | --- |
| OpenClaw | `OpenClaw 2026.5.22 (a374c3a)` |
| Node | `v22.22.2` |
| npm | `10.9.7` |
| Uptime | ~18 dias |
| Gateway | `openclaw-gateway.service` ativo |
| Gateway bind | `127.0.0.1:18789` |
| Gateway health | `/health` HTTP 200 |

## Gateway resources

| Métrica | Valor observado |
| --- | --- |
| PID | `3332914` |
| TasksCurrent / TasksMax | `257 / 1200` |
| MemoryCurrent | `1,585,823,744 bytes` |
| MemoryHigh | `2,202,009,600 bytes` |
| MemoryMax | `2,726,297,600 bytes` |
| Restarts | `0` |
| Journal warnings 24h | `0` |

## Public/local ports

| Porta | Escopo | Serviço |
| --- | --- | --- |
| 22 | público | SSH |
| 8080 | público | Evolution API Docker |
| 18789 | loopback | OpenClaw gateway/UI |
| 18791 | loopback | OpenClaw internal API, HTTP 401 sem auth |
| 18800 | loopback | Browser/CDP |
| 8099 | público/local | processo Python legado observado, não alterado |

## Docker

| Container | Imagem | Status |
| --- | --- | --- |
| `evolution-api` | `atendai/evolution-api:v2.2.3` | Up 2 weeks, `0.0.0.0:8080->8080` |
| `evolution-postgres` | `postgres:15-alpine` | Up 2 weeks |

## Plugins, MCPs e agentes

| Tipo | Itens |
| --- | --- |
| Plugins | `anthropic`, `browser`, `codex`, `deepseek`, `google`, `lossless-claw`, `moonshot`, `openai`, `slack`, `telegram`, `zai` |
| MCP servers | `autentique`, `evolution-whatsapp`, `gamma`, `gmail`, `google-drive`, `notes-gmail`, `notes-google-drive`, `pipefy` |
| Agentes | `main`, `agendamento-notes`, `agente-marketing` |
| MCP idle TTL | `180000 ms` |

## Timers systemd de usuário

- `openclaw-cli-orphan-reaper.timer`
- `openclaw-slack-no-silence-watchdog.timer`
- `openclaw-browser-ensure.timer`
- `openclaw-mcp-dedup-reaper.timer`
- `openclaw-codex-session-reaper.timer`
- `marketing-cron-gate.timer`
- `openclaw-health-watchdog.timer`
- `openclaw-gateway-refresh.timer`

## Crons de usuário

7 jobs ativos observados:

1. `notes-scheduler` a cada 2 minutos.
2. `medical-monitor` segunda 08:17.
3. `medical-exam-monitor` segunda 08:47.
4. `medical-poll` a cada 2 minutos.
5. `medical-slack-otp` a cada 4 minutos.
6. `medical-approval-monitor` a cada 2 minutos.
7. `review-stale-reminders` diário 09:30.

## Estados agregados

| Fluxo | Métricas |
| --- | --- |
| Médico | `pending=2`, `completed=2`, `notifications=46`, `contact_approvals=10`, `whatsapp_conversations=2`, `context_events=88` |
| Notes | `seen_emails=19`, `seen_hashes=29`, `proposals=29`, `pending_review=4`, `processing_deferred=1`, `errors=9` |

## Erros/logs recentes

Amostra sanitizada das últimas 3000 linhas:

| Log | Error | Deferred | Success |
| --- | ---: | ---: | ---: |
| `agendamento-medico-automation.log` | 0 | 0 | 0 |
| `agendamento-notes.log` | 0 | 0 | 432 |

## Custo/uso

A amostra de trajetórias recente não expôs campos diretos `input_tokens`, `output_tokens` ou `total_tokens`. A fase 2 deve instrumentar rollups de custo sem inventar valores.
