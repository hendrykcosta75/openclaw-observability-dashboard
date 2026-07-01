import {
  Activity,
  AlertTriangle,
  Bot,
  CircleDollarSign,
  Clock3,
  FileWarning,
  HeartPulse,
  ListChecks,
  LucideIcon,
  ShieldCheck,
  TerminalSquare,
  TimerReset,
} from "lucide-react";

export type HealthTone = "ok" | "warn" | "danger" | "planned";

export interface MetricCard {
  label: string;
  value: string;
  detail: string;
  tone: HealthTone;
  icon: LucideIcon;
  progress?: number;
}

export interface MonitorItem {
  name: string;
  status: string;
  detail: string;
  tone: HealthTone;
}

export const snapshotMeta = {
  collectedAt: "2026-07-01T09:40:11-03:00",
  serverIp: "54.175.2.242",
  host: "ip-172-26-11-186",
  openclawVersion: "OpenClaw 2026.5.22 (a374c3a)",
  nodeVersion: "v22.22.2",
  npmVersion: "10.9.7",
};

export const topMetrics: MetricCard[] = [
  {
    label: "Tokens",
    value: "128k",
    detail: "Mock: R$ 184,32 estimados até o coletor real",
    tone: "ok",
    icon: CircleDollarSign,
    progress: 42,
  },
  {
    label: "Agentes",
    value: "3",
    detail: "main, agendamento-notes e agente-marketing",
    tone: "ok",
    icon: Bot,
  },
  {
    label: "Gateway",
    value: "Ativo",
    detail: "Endpoint de health respondeu em loopback",
    tone: "ok",
    icon: HeartPulse,
  },
  {
    label: "Erros 24h",
    value: "0 warnings",
    detail: "Journal do gateway no recorte recente",
    tone: "ok",
    icon: ShieldCheck,
  },
];

export const serviceRows: MonitorItem[] = [
  { name: "openclaw-gateway.service", status: "running", detail: "PID 3332914 · MemoryMax 2.73 GB · TasksMax 1200", tone: "ok" },
  { name: "Evolution API", status: "up", detail: "Docker `evolution-api` · público em :8080", tone: "ok" },
  { name: "Evolution Postgres", status: "up", detail: "Docker `evolution-postgres` · interno 5432", tone: "ok" },
  { name: "Browser/CDP", status: "loopback", detail: "Chrome ouvindo em 127.0.0.1:18800", tone: "ok" },
  { name: "Dashboard Nginx", status: "fase 1", detail: "Proxy público para Next.js local :3100", tone: "planned" },
];

export const agentRows = [
  {
    name: "main",
    purpose: "Slack principal, automação médica e rotas gerais",
    sessions: "62",
    trajectories: "38",
    lastSeen: "2026-07-01 09:41",
    tone: "ok" as HealthTone,
  },
  {
    name: "agendamento-notes",
    purpose: "Notas de reunião, Gmail/Drive/ClickUp e lembretes",
    sessions: "41",
    trajectories: "18",
    lastSeen: "2026-07-01 09:46",
    tone: "warn" as HealthTone,
  },
  {
    name: "agente-marketing",
    purpose: "Cron e canal Slack de marketing",
    sessions: "3179",
    trajectories: "1591",
    lastSeen: "2026-06-30 13:48",
    tone: "ok" as HealthTone,
  },
];

export const timerRows: MonitorItem[] = [
  { name: "health-watchdog", status: "5 min", detail: "VPS, gateway, browser, Evolution, Slack, MCPs e crons", tone: "ok" },
  { name: "mcp-dedup-reaper", status: "3 min", detail: "Remove MCPs duplicados sob o mesmo pai Codex", tone: "ok" },
  { name: "codex-session-reaper", status: "5 min", detail: "Limpa sessões Codex ociosas", tone: "ok" },
  { name: "browser-ensure", status: "5 min", detail: "Mantém browser/CDP pronto", tone: "ok" },
  { name: "slack-no-silence-watchdog", status: "1 min", detail: "Detecta menções Slack sem resposta visível", tone: "ok" },
  { name: "gateway-refresh", status: "04:00", detail: "Restart diário controlado do gateway", tone: "ok" },
];

export const cronRows = [
  { name: "notes-scheduler", cadence: "*/2 min", target: "agendamento-notes.mjs scheduler", health: "sem falhas" },
  { name: "medical-poll", cadence: "*/2 min", target: "agendamento-medico-automation.mjs poll", health: "sem falhas" },
  { name: "medical-approval-monitor", cadence: "*/2 min", target: "approval-monitor", health: "sem falhas" },
  { name: "medical-slack-otp", cadence: "*/4 min", target: "slack-otp", health: "sem falhas" },
  { name: "medical-monitor", cadence: "seg 08:17", target: "monitor pesado", health: "janela pesada" },
  { name: "medical-exam-monitor", cadence: "seg 08:47", target: "exam-monitor pesado", health: "janela pesada" },
  { name: "review-stale-reminders", cadence: "09:30 diário", target: "lembretes de revisão", health: "sem falhas" },
];

export const stateCards = [
  {
    label: "Fluxo médico",
    value: "2 pendentes",
    detail: "2 concluídos · 46 notificações · 88 eventos WhatsApp importados",
    icon: Activity,
    tone: "ok" as HealthTone,
  },
  {
    label: "Aprovações contato",
    value: "10",
    detail: "6 deferred_not_due · 2 rejected · 2 scheduled",
    icon: ListChecks,
    tone: "ok" as HealthTone,
  },
  {
    label: "Notes proposals",
    value: "29",
    detail: "19 merged · 4 pending_review · 1 processing_deferred",
    icon: FileWarning,
    tone: "warn" as HealthTone,
  },
  {
    label: "Notes errors",
    value: "9",
    detail: "Contador agregado do fluxo Notes",
    icon: AlertTriangle,
    tone: "warn" as HealthTone,
  },
];

export const logRows = [
  { file: "agendamento-medico-automation.log", sampled: "3000 linhas", errors: 0, deferred: 0, success: 0, size: "18.4 MB" },
  { file: "agendamento-notes.log", sampled: "3000 linhas", errors: 0, deferred: 0, success: 432, size: "137.5 MB" },
  { file: "journal openclaw-gateway", sampled: "24h", errors: 0, deferred: 0, success: 0, size: "warnings=0" },
];

export const sidebarStats = [
  { label: "Timers", value: "8", icon: TimerReset },
  { label: "Crons", value: "7", icon: Clock3 },
  { label: "Serviços", value: "5", icon: TerminalSquare },
];

export interface CostInstrumentation {
  tokenCollection: string;
  traceSource: string;
  priceMapStatus: string;
  providers: { id: string; models: string[] }[];
}

export const costDetails: CostInstrumentation = {
  tokenCollection: "Tokens not instrumented yet",
  traceSource: "OpenClaw/Codex traces — usage field pending validation",
  priceMapStatus: "Provider price map not checked in",
  providers: [
    { id: "openai", models: ["gpt-5.4", "gpt-5-mini"] },
    { id: "anthropic", models: ["claude-sonnet-4"] },
  ],
};

export interface CronCategoryGroup {
  category: string;
  description: string;
  jobs: string[];
  timers: string[];
}

export const cronCategoryGroups: CronCategoryGroup[] = [
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

export interface GatewayResourceMetrics {
  pid: string;
  memoryCurrent: string;
  memoryHigh: string;
  memoryMax: string;
  tasksCurrent: string;
  tasksMax: string;
  nRestarts: string;
  healthLatencyMs: string;
  healthEndpoint: string;
}

export interface PortSummary {
  port: string;
  bind: string;
  process: string;
  exposure: string;
}

export const gatewayDetails: GatewayResourceMetrics = {
  pid: "3332914",
  memoryCurrent: "892 MB",
  memoryHigh: "1.1 GB",
  memoryMax: "2.73 GB",
  tasksCurrent: "257",
  tasksMax: "1200",
  nRestarts: "0",
  healthLatencyMs: "12",
  healthEndpoint: "http://127.0.0.1:18789/health",
};

export const portSummaries: PortSummary[] = [
  { port: "18789", bind: "127.0.0.1", process: "openclaw-gateway", exposure: "loopback" },
  { port: "18800", bind: "127.0.0.1", process: "chrome-cdp", exposure: "loopback" },
  { port: "3100", bind: "127.0.0.1", process: "next-dashboard", exposure: "loopback" },
  { port: "8080", bind: "0.0.0.0", process: "evolution-api", exposure: "public" },
  { port: "80", bind: "0.0.0.0", process: "nginx", exposure: "public" },
];

export interface AgentDetail {
  name: string;
  modelId: string;
  plugins: string[];
  mcps: string[];
  recentEvents: string;
  tone: HealthTone;
}

export const agentDetails: AgentDetail[] = [
  {
    name: "main",
    modelId: "gpt-5.4",
    plugins: ["slack", "medical-automation", "clickup"],
    mcps: ["filesystem", "postgres-readonly"],
    recentEvents: "12 runs / 24h",
    tone: "ok",
  },
  {
    name: "agendamento-notes",
    modelId: "gpt-5.4",
    plugins: ["gmail", "drive", "clickup", "notes-scheduler"],
    mcps: ["google-workspace", "sqlite-state"],
    recentEvents: "28 runs / 24h",
    tone: "warn",
  },
  {
    name: "agente-marketing",
    modelId: "gpt-5-mini",
    plugins: ["slack-marketing", "cron-publisher"],
    mcps: ["web-search"],
    recentEvents: "3 runs / 24h",
    tone: "ok",
  },
];

export interface LogWindowBucket {
  window: string;
  errors: number;
  warnings: number;
  deferred: number;
}

export const logWindowBuckets: LogWindowBucket[] = [
  { window: "24h", errors: 0, warnings: 0, deferred: 8 },
  { window: "7d", errors: 0, warnings: 2, deferred: 41 },
];

export const usageChartData = [
  { date: "2026-06-18", cost: 12.4 },
  { date: "2026-06-19", cost: 18.7 },
  { date: "2026-06-20", cost: 16.2 },
  { date: "2026-06-21", cost: 24.9 },
  { date: "2026-06-22", cost: 28.5 },
  { date: "2026-06-23", cost: 22.8 },
  { date: "2026-06-24", cost: 33.1 },
  { date: "2026-06-25", cost: 37.6 },
  { date: "2026-06-26", cost: 31.4 },
  { date: "2026-06-27", cost: 42.9 },
  { date: "2026-06-28", cost: 36.2 },
  { date: "2026-06-29", cost: 47.8 },
  { date: "2026-06-30", cost: 44.3 },
  { date: "2026-07-01", cost: 52.6 },
];
