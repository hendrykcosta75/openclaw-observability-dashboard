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
    value: "4",
    detail: "main, agendamento-medico, agendamento-notes e agente-marketing",
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
    purpose: "Slack principal e rotas gerais da Cleo",
    sessions: "28",
    trajectories: "14",
    lastSeen: "2026-07-01 09:41",
    tone: "ok" as HealthTone,
  },
  {
    name: "agendamento-medico",
    purpose: "Canal Slack médico, planilha, WhatsApp e Calendar",
    sessions: "34",
    trajectories: "24",
    lastSeen: "2026-07-03 13:28",
    tone: "warn" as HealthTone,
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
    plugins: ["slack", "clickup"],
    mcps: ["filesystem", "postgres-readonly"],
    recentEvents: "4 runs / 24h",
    tone: "ok",
  },
  {
    name: "agendamento-medico",
    modelId: "gpt-5.4",
    plugins: ["slack", "medical-automation", "browser"],
    mcps: ["gmail", "google-drive", "evolution-whatsapp"],
    recentEvents: "18 runs / 24h",
    tone: "warn",
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

export interface DashboardNotification {
  id: string;
  title: string;
  summary: string;
  tone: HealthTone;
  detectedAt: string;
  source: string;
  details: { label: string; value: string }[];
  suggestedAction: string;
}

export const dashboardNotifications: DashboardNotification[] = [
  {
    id: "evolution-whatsapp-disconnected",
    title: "WhatsApp desconectado no Evolution",
    summary: "Instância medico perdeu sessão com o gateway WhatsApp.",
    tone: "danger",
    detectedAt: "2026-07-01 09:38",
    source: "health-watchdog · Evolution API",
    details: [
      { label: "Instância", value: "medico" },
      { label: "Container", value: "evolution-api" },
      { label: "Último QR", value: "2026-06-28 14:12" },
      { label: "Health check", value: "connectionState=close" },
      { label: "Impacto", value: "Fluxo médico sem ingestão WhatsApp" },
    ],
    suggestedAction: "Reconectar via Evolution manager ou reiniciar a instância medico.",
  },
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

export interface AgentCostRow {
  agentId: string;
  label: string;
  cost7d: number;
  costToday: number;
  sharePercent: number;
  dailyCosts: { date: string; cost: number }[];
  tokens7d: TokenSpend;
  tokensToday: TokenSpend;
  calculationBases: CostCalculationBasis[];
}

export interface TokenSpend {
  input: number;
  output: number;
}

export interface CostCalculationBasis {
  provider: string;
  modelId: string;
  inputRatePer1M: string;
  outputRatePer1M: string;
}

export interface CostKpiCard {
  id: string;
  label: string;
  value: string;
  comparison: string;
  trend: "up" | "down" | "flat";
  modalTitle: string;
  modalDetails: { label: string; value: string }[];
  tokens: TokenSpend;
  calculationBases: CostCalculationBasis[];
}

export interface ErrorHighlight {
  source: string;
  summary: string;
  tone: HealthTone;
}

export const openAiRates = {
  gpt54: {
    provider: "openai",
    modelId: "gpt-5.4",
    inputRatePer1M: "R$ 12,50 / 1M tokens",
    outputRatePer1M: "R$ 37,50 / 1M tokens",
  },
  gpt5Mini: {
    provider: "openai",
    modelId: "gpt-5-mini",
    inputRatePer1M: "R$ 0,75 / 1M tokens",
    outputRatePer1M: "R$ 3,00 / 1M tokens",
  },
} as const satisfies Record<string, CostCalculationBasis>;

export const blendedCostBases: CostCalculationBasis[] = [openAiRates.gpt54, openAiRates.gpt5Mini];

export const agentCostRows: AgentCostRow[] = [
  {
    agentId: "agente-marketing",
    label: "Marketing",
    cost7d: 169.8,
    costToday: 30.5,
    sharePercent: 58,
    tokens7d: { input: 118_400_000, output: 27_800_000 },
    tokensToday: { input: 18_400_000, output: 4_200_000 },
    calculationBases: [openAiRates.gpt5Mini],
    dailyCosts: [
      { date: "2026-06-25", cost: 21.8 },
      { date: "2026-06-26", cost: 18.2 },
      { date: "2026-06-27", cost: 24.9 },
      { date: "2026-06-28", cost: 21.0 },
      { date: "2026-06-29", cost: 27.7 },
      { date: "2026-06-30", cost: 25.7 },
      { date: "2026-07-01", cost: 30.5 },
    ],
  },
  {
    agentId: "agendamento-medico",
    label: "Médico",
    cost7d: 52.0,
    costToday: 9.2,
    sharePercent: 18,
    tokens7d: { input: 28_400_000, output: 6_500_000 },
    tokensToday: { input: 5_400_000, output: 1_200_000 },
    calculationBases: [openAiRates.gpt54],
    dailyCosts: [
      { date: "2026-06-25", cost: 6.8 },
      { date: "2026-06-26", cost: 5.6 },
      { date: "2026-06-27", cost: 7.6 },
      { date: "2026-06-28", cost: 6.4 },
      { date: "2026-06-29", cost: 8.5 },
      { date: "2026-06-30", cost: 7.9 },
      { date: "2026-07-01", cost: 9.2 },
    ],
  },
  {
    agentId: "main",
    label: "Principal",
    cost7d: 27.1,
    costToday: 5.0,
    sharePercent: 9,
    tokens7d: { input: 14_200_000, output: 3_300_000 },
    tokensToday: { input: 2_800_000, output: 600_000 },
    calculationBases: [openAiRates.gpt54],
    dailyCosts: [
      { date: "2026-06-25", cost: 3.4 },
      { date: "2026-06-26", cost: 2.9 },
      { date: "2026-06-27", cost: 4.0 },
      { date: "2026-06-28", cost: 3.4 },
      { date: "2026-06-29", cost: 4.4 },
      { date: "2026-06-30", cost: 4.1 },
      { date: "2026-07-01", cost: 5.0 },
    ],
  },
  {
    agentId: "agendamento-notes",
    label: "Notas",
    cost7d: 43.9,
    costToday: 7.9,
    sharePercent: 15,
    tokens7d: { input: 21_300_000, output: 5_400_000 },
    tokensToday: { input: 3_100_000, output: 900_000 },
    calculationBases: [openAiRates.gpt54],
    dailyCosts: [
      { date: "2026-06-25", cost: 5.6 },
      { date: "2026-06-26", cost: 4.7 },
      { date: "2026-06-27", cost: 6.4 },
      { date: "2026-06-28", cost: 5.4 },
      { date: "2026-06-29", cost: 7.2 },
      { date: "2026-06-30", cost: 6.6 },
      { date: "2026-07-01", cost: 7.9 },
    ],
  },
];

export const costKpiCards: CostKpiCard[] = [
  {
    id: "cost-today",
    label: "Custo hoje",
    value: "R$ 52,60",
    comparison: "+19% vs ontem",
    trend: "up",
    modalTitle: "Custo de hoje",
    modalDetails: [
      { label: "Total", value: "R$ 52,60" },
      { label: "Ontem", value: "R$ 44,30" },
      { label: "Variação", value: "+R$ 8,30 (+19%)" },
      { label: "Agente mais caro", value: "Marketing · R$ 30,50" },
      { label: "Média dos últimos 7 dias", value: "R$ 41,83" },
      { label: "Acima da média", value: "+R$ 10,77 (+26%)" },
    ],
    tokens: { input: 29_700_000, output: 6_900_000 },
    calculationBases: blendedCostBases,
  },
  {
    id: "cost-7d",
    label: "Custo 7 dias",
    value: "R$ 292,80",
    comparison: "+87% vs semana anterior",
    trend: "up",
    modalTitle: "Custo dos últimos 7 dias",
    modalDetails: [
      { label: "Total 7 dias", value: "R$ 292,80" },
      { label: "Semana anterior", value: "R$ 156,60" },
      { label: "Variação", value: "+R$ 136,20 (+87%)" },
      { label: "Maior contribuidor", value: "Marketing · 58%" },
      { label: "Menor contribuidor", value: "Notas · 15%" },
      { label: "Período", value: "25/06 – 01/07" },
    ],
    tokens: { input: 182_300_000, output: 43_000_000 },
    calculationBases: blendedCostBases,
  },
  {
    id: "cost-month",
    label: "Custo do mês",
    value: "R$ 52,60",
    comparison: "jul/2026 · parcial",
    trend: "flat",
    modalTitle: "Custo do mês atual",
    modalDetails: [
      { label: "Mês", value: "Julho/2026" },
      { label: "Acumulado", value: "R$ 52,60" },
      { label: "Dias registrados", value: "1 de 31" },
      { label: "Mês anterior", value: "Junho · R$ 892,40" },
      { label: "Variação vs junho", value: "parcial — junho fechou em R$ 892,40" },
      { label: "Agente mais caro", value: "Marketing · R$ 30,50" },
    ],
    tokens: { input: 29_700_000, output: 6_900_000 },
    calculationBases: blendedCostBases,
  },
  {
    id: "cost-peak",
    label: "Dia mais caro",
    value: "01/07",
    comparison: "R$ 52,60",
    trend: "up",
    modalTitle: "Dia de pico de custo",
    modalDetails: [
      { label: "Data", value: "01/07/2026" },
      { label: "Custo total", value: "R$ 52,60" },
      { label: "Agente responsável", value: "Marketing · R$ 30,50 (58%)" },
      { label: "vs média diária", value: "+R$ 10,77 (+26%)" },
      { label: "vs dia anterior", value: "+R$ 8,30 (+19%)" },
      { label: "2º lugar", value: "29/06 · R$ 47,80" },
    ],
    tokens: { input: 29_700_000, output: 6_900_000 },
    calculationBases: blendedCostBases,
  },
];

export const serviceHealthSummary: MonitorItem[] = [
  { name: "Gateway OpenClaw", status: "Rodando", detail: "Respondeu ao health check", tone: "ok" },
  { name: "Evolution API", status: "Desconectado", detail: "WhatsApp da instância medico offline", tone: "danger" },
  { name: "Dashboard", status: "Online", detail: "Painel acessível via Nginx", tone: "ok" },
];

export const errorHighlights: ErrorHighlight[] = [
  { source: "agendamento-notes", summary: "0 erros · 432 eventos ok nas últimas 24h", tone: "ok" },
  { source: "agendamento-medico", summary: "0 erros · fluxo médico sem novos eventos WhatsApp", tone: "warn" },
  { source: "openclaw-gateway", summary: "0 erros · 0 warnings no journal de 24h", tone: "ok" },
];

export interface MonthlyCostRow {
  month: string;
  label: string;
  cost: number;
  partial?: boolean;
  tokens: TokenSpend;
  calculationBases: CostCalculationBasis[];
}

export const monthlyCostYearData: MonthlyCostRow[] = [
  { month: "2026-01", label: "Jan", cost: 842.5, tokens: { input: 512_000_000, output: 118_000_000 }, calculationBases: blendedCostBases },
  { month: "2026-02", label: "Fev", cost: 921.3, tokens: { input: 548_000_000, output: 126_000_000 }, calculationBases: blendedCostBases },
  { month: "2026-03", label: "Mar", cost: 1054.2, tokens: { input: 601_000_000, output: 141_000_000 }, calculationBases: blendedCostBases },
  { month: "2026-04", label: "Abr", cost: 1187.6, tokens: { input: 672_000_000, output: 158_000_000 }, calculationBases: blendedCostBases },
  { month: "2026-05", label: "Mai", cost: 1324.8, tokens: { input: 728_000_000, output: 171_000_000 }, calculationBases: blendedCostBases },
  { month: "2026-06", label: "Jun", cost: 892.4, tokens: { input: 498_000_000, output: 116_000_000 }, calculationBases: blendedCostBases },
  { month: "2026-07", label: "Jul", cost: 52.6, partial: true, tokens: { input: 29_700_000, output: 6_900_000 }, calculationBases: blendedCostBases },
];
