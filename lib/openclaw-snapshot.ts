import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  Container,
  FileWarning,
  Gauge,
  GitBranch,
  HeartPulse,
  ListChecks,
  LucideIcon,
  RadioTower,
  Server,
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
  safety: "Snapshot sanitizado: sem tokens, payloads, PII ou logs brutos.",
};

export const topMetrics: MetricCard[] = [
  {
    label: "Gateway",
    value: "Ativo",
    detail: "Health 200 em 127.0.0.1:18789",
    tone: "ok",
    icon: HeartPulse,
  },
  {
    label: "Tasks",
    value: "257 / 1200",
    detail: "TasksCurrent dentro do limite",
    tone: "ok",
    icon: Gauge,
    progress: 21,
  },
  {
    label: "Memória",
    value: "1.59 GB",
    detail: "MemoryCurrent; teto 2.73 GB",
    tone: "warn",
    icon: Server,
    progress: 58,
  },
  {
    label: "Journal 24h",
    value: "0 warnings",
    detail: "Sem buckets de erro críticos",
    tone: "ok",
    icon: ShieldCheck,
  },
  {
    label: "Agentes",
    value: "3",
    detail: "main, notes e marketing",
    tone: "ok",
    icon: Bot,
  },
  {
    label: "MCPs",
    value: "8",
    detail: "Idle TTL 180s configurado",
    tone: "ok",
    icon: GitBranch,
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
  { name: "notes-scheduler", cadence: "*/2 min", target: "agendamento-notes.mjs scheduler", health: "ok" },
  { name: "medical-poll", cadence: "*/2 min", target: "agendamento-medico-automation.mjs poll", health: "ok" },
  { name: "medical-approval-monitor", cadence: "*/2 min", target: "approval-monitor", health: "ok" },
  { name: "medical-slack-otp", cadence: "*/4 min", target: "slack-otp", health: "ok" },
  { name: "medical-monitor", cadence: "seg 08:17", target: "monitor pesado", health: "queued" },
  { name: "medical-exam-monitor", cadence: "seg 08:47", target: "exam-monitor pesado", health: "queued" },
  { name: "review-stale-reminders", cadence: "09:30 diário", target: "lembretes de revisão", health: "ok" },
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
    detail: "Contador agregado em state; sem log bruto exposto",
    icon: AlertTriangle,
    tone: "warn" as HealthTone,
  },
];

export const logRows = [
  { file: "agendamento-medico-automation.log", sampled: "3000 linhas", errors: 0, deferred: 0, success: 0, size: "18.4 MB" },
  { file: "agendamento-notes.log", sampled: "3000 linhas", errors: 0, deferred: 0, success: 432, size: "137.5 MB" },
  { file: "journal openclaw-gateway", sampled: "24h", errors: 0, deferred: 0, success: 0, size: "warnings=0" },
];

export const costPlan = [
  {
    name: "Tokens por agente",
    status: "Instrumentar",
    detail: "Trajetórias recentes não expuseram campos input/output/total_tokens.",
    icon: CircleDollarSign,
  },
  {
    name: "Provider/model map",
    status: "Planejado",
    detail: "codex/gpt-5.5, claude-sonnet, OpenAI/Google/ZAI/Moonshot por agente.",
    icon: RadioTower,
  },
  {
    name: "Infra Lightsail",
    status: "Planejado",
    detail: "Integrar AWS Cost Explorer ou custo fixo mensal do instance size.",
    icon: Container,
  },
  {
    name: "Rollup diário",
    status: "Planejado",
    detail: "JSON/SQLite local com custo estimado por dia, agente e fluxo.",
    icon: CalendarClock,
  },
];

export const deploymentPlan = [
  { step: "Layout", status: "feito", detail: "Next.js dashboard com snapshot sanitizado e design Baisync-like." },
  { step: "Coletor", status: "próximo", detail: "Gerar JSON sanitizado via timer, sem comandos por request." },
  { step: "Custos", status: "próximo", detail: "Encontrar fonte real de tokens/uso; não inferir valores." },
  { step: "Alertas", status: "próximo", detail: "Incidentes, drill-down seguro e links para playbooks." },
];

export const navSections = [
  { label: "Monitoramento", items: ["Overview", "Custos", "Crons", "Agentes", "Gateway", "Logs"] },
  { label: "Harness", items: ["Plano", "Design system", "Coleta segura"] },
];

export const sidebarStats = [
  { label: "Timers", value: "8", icon: TimerReset },
  { label: "Crons", value: "7", icon: Clock3 },
  { label: "Serviços", value: "5", icon: TerminalSquare },
];
