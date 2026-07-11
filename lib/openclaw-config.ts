import { CostCalculationBasis } from "./openclaw-snapshot-types";

export const OPENCLAW_VERSION = "OpenClaw 2026.5.22 (a374c3a)";
export const NODE_VERSION = "v22.22.2";
export const NPM_VERSION = "10.9.7";
export const SERVER_IP = "54.175.2.242";
export const HOST = "ip-172-26-11-186";

export const HEALTH_LATENCY_OK_MS = 100;

export const agentPurposes: Record<string, string> = {
  main: "Slack principal e rotas gerais da Cleo",
  "agendamento-medico": "Canal Slack médico, planilha, WhatsApp e Calendar",
  "agendamento-notes": "Notas de reunião, Gmail/Drive/ClickUp e lembretes",
  "agente-marketing": "Cron e canal Slack de marketing",
  defaults: "Configurações padrão e fallbacks",
};

export const agentLabels: Record<string, string> = {
  main: "Principal",
  "agendamento-medico": "Médico",
  "agendamento-notes": "Notas",
  "agente-marketing": "Marketing",
  defaults: "Padrões",
};

export const agentPlugins: Record<string, string[]> = {
  main: ["slack", "clickup"],
  "agendamento-medico": ["slack", "medical-automation", "browser"],
  "agendamento-notes": ["gmail", "drive", "clickup", "notes-scheduler"],
  "agente-marketing": ["slack-marketing", "cron-publisher"],
  defaults: [],
};

export const agentMcps: Record<string, string[]> = {
  main: ["filesystem", "postgres-readonly"],
  "agendamento-medico": ["gmail", "google-drive", "evolution-whatsapp"],
  "agendamento-notes": ["google-workspace", "sqlite-state"],
  "agente-marketing": ["web-search"],
  defaults: [],
};

export const cronCadences: Record<string, string> = {
  "notes-scheduler": "*/2 min",
  "medical-poll": "*/2 min",
  "medical-approval-monitor": "*/2 min",
  "medical-slack-otp": "*/4 min",
  "medical-monitor": "seg 08:17",
  "medical-exam-monitor": "seg 08:47",
  "review-stale-reminders": "09:30 diário",
};

export const cronTargets: Record<string, string> = {
  "notes-scheduler": "agendamento-notes.mjs scheduler",
  "medical-poll": "agendamento-medico-automation.mjs poll",
  "medical-approval-monitor": "approval-monitor",
  "medical-slack-otp": "slack-otp",
  "medical-monitor": "monitor pesado",
  "medical-exam-monitor": "exam-monitor pesado",
  "review-stale-reminders": "lembretes de revisão",
};

export const cronCategoryGroups = [
  {
    category: "Notes",
    description: "Scheduler e propostas de reunião",
    jobs: ["notes-scheduler", "review-stale-reminders"],
    timers: ["health-watchdog"],
  },
  {
    category: "Medical",
    description: "Poll, aprovações, OTP e monitores pesados",
    jobs: ["medical-poll", "medical-approval-monitor", "medical-slack-otp", "medical-monitor", "medical-exam-monitor"],
    timers: ["slack-no-silence-watchdog", "browser-ensure"],
  },
  {
    category: "Platform",
    description: "Gateway, MCPs e sessões Codex",
    jobs: [],
    timers: ["mcp-dedup-reaper", "codex-session-reaper", "gateway-refresh"],
  },
];

export const timerDetails: Record<string, { cadence: string; detail: string }> = {
  "health-watchdog": { cadence: "5 min", detail: "VPS, gateway, browser, Evolution, Slack, MCPs e crons" },
  "mcp-dedup-reaper": { cadence: "3 min", detail: "Remove MCPs duplicados sob o mesmo pai Codex" },
  "codex-session-reaper": { cadence: "5 min", detail: "Limpa sessões Codex ociosas" },
  "browser-ensure": { cadence: "5 min", detail: "Mantém browser/CDP pronto" },
  "slack-no-silence-watchdog": { cadence: "1 min", detail: "Detecta menções Slack sem resposta visível" },
  "gateway-refresh": { cadence: "04:00", detail: "Restart diário controlado do gateway" },
  "marketing-cron-gate": { cadence: "1 min", detail: "Libera execução de cron de marketing" },
  "openclaw-browser-ensure": { cadence: "5 min", detail: "Mantém browser/CDP pronto" },
  "openclaw-cli-orphan-reaper": { cadence: "5 min", detail: "Remove processos CLI órfãos" },
  "openclaw-codex-session-reaper": { cadence: "5 min", detail: "Limpa sessões Codex ociosas" },
  "openclaw-gateway-refresh": { cadence: "04:00", detail: "Restart diário controlado do gateway" },
  "openclaw-health-watchdog": { cadence: "5 min", detail: "VPS, gateway, browser, Evolution, Slack, MCPs e crons" },
  "openclaw-mcp-dedup-reaper": { cadence: "3 min", detail: "Remove MCPs duplicados sob o mesmo pai Codex" },
  "openclaw-observability-collector": { cadence: "5 min", detail: "Coleta snapshot de observabilidade" },
  "openclaw-slack-no-silence-watchdog": { cadence: "1 min", detail: "Detecta menções Slack sem resposta visível" },
};

export const defaultServicePortMapping: Record<string, { port: string; bind: string; exposure: string }> = {
  "openclaw-gateway.service": { port: "18789", bind: "127.0.0.1", exposure: "loopback" },
  "evolution-api": { port: "8080", bind: "0.0.0.0", exposure: "public" },
  "evolution-postgres": { port: "5432", bind: "127.0.0.1", exposure: "loopback" },
  "chrome-cdp": { port: "18800", bind: "127.0.0.1", exposure: "loopback" },
  "next-dashboard": { port: "3100", bind: "127.0.0.1", exposure: "loopback" },
  "nginx": { port: "80", bind: "0.0.0.0", exposure: "public" },
};

export const gatewayHealthEndpoint = "http://127.0.0.1:18789/health";

export const openAiRates: Record<string, CostCalculationBasis> = {
  gpt55: {
    provider: "openai",
    modelId: "gpt-5.5",
    inputRatePer1M: "US$ 5,00 / 1M tokens",
    outputRatePer1M: "US$ 30,00 / 1M tokens",
    inputRateUsdPer1M: 5.0,
    outputRateUsdPer1M: 30.0,
  },
  gpt54: {
    provider: "openai",
    modelId: "gpt-5.4",
    inputRatePer1M: "US$ 2,50 / 1M tokens",
    outputRatePer1M: "US$ 15,00 / 1M tokens",
    inputRateUsdPer1M: 2.5,
    outputRateUsdPer1M: 15.0,
  },
  gpt5Mini: {
    provider: "openai",
    modelId: "gpt-5-mini",
    inputRatePer1M: "US$ 0,25 / 1M tokens",
    outputRatePer1M: "US$ 2,00 / 1M tokens",
    inputRateUsdPer1M: 0.25,
    outputRateUsdPer1M: 2.0,
  },
  claudeSonnet46: {
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    inputRatePer1M: "US$ 3,00 / 1M tokens",
    outputRatePer1M: "US$ 15,00 / 1M tokens",
    inputRateUsdPer1M: 3.0,
    outputRateUsdPer1M: 15.0,
  },
};

export const blendedCostBases: CostCalculationBasis[] = [openAiRates.gpt55, openAiRates.gpt54, openAiRates.gpt5Mini];

export const costProviders = [
  { id: "openai", models: ["gpt-5.5", "gpt-5.4", "gpt-5-mini"] },
  { id: "anthropic", models: ["claude-sonnet-4"] },
];

export const fallbackLogWindowBuckets = [
  { window: "24h", errors: 0, warnings: 0, deferred: 0 },
  { window: "7d", errors: 0, warnings: 0, deferred: 0 },
];

export const defaultActivityTimeline: {
  id: string;
  time: string;
  flow: string;
  summary: string;
  tone: import("./openclaw-snapshot-types").HealthTone;
}[] = [];
