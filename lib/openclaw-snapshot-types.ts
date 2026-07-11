export type HealthTone = "ok" | "warn" | "danger" | "planned";

export type SnapshotIconName =
  | "activity"
  | "alert-triangle"
  | "bot"
  | "circle-dollar-sign"
  | "clock-3"
  | "file-warning"
  | "heart-pulse"
  | "list-checks"
  | "shield-check"
  | "terminal-square"
  | "timer-reset";

export interface MetricCard {
  label: string;
  value: string;
  detail: string;
  tone: HealthTone;
  icon: SnapshotIconName;
  progress?: number;
}

export interface MonitorItem {
  name: string;
  status: string;
  detail: string;
  tone: HealthTone;
}

export interface DayStatus {
  headline: string;
  summary: string;
  tone: HealthTone;
}

export interface AttentionItem {
  id: string;
  label: string;
  count: number;
  description: string;
  tone: HealthTone;
  href?: string;
  notificationId?: string;
}

export interface FlowSummaryCard {
  id: string;
  label: string;
  headline: string;
  detail: string;
  tone: HealthTone;
  href: string;
}

export interface ActivityTimelineItem {
  id: string;
  time: string;
  flow: string;
  summary: string;
  tone: HealthTone;
}

export interface WhatsAppChannelStatus {
  connected: boolean;
  instanceLabel: string;
  headline: string;
  impact: string;
  lastActiveLabel: string;
  tone: HealthTone;
}

export interface CostInstrumentation {
  tokenCollection: string;
  traceSource: string;
  priceMapStatus: string;
  providers: { id: string; models: string[] }[];
}

export interface CronCategoryGroup {
  category: string;
  description: string;
  jobs: string[];
  timers: string[];
}

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

export interface AgentDetail {
  name: string;
  modelId: string;
  plugins: string[];
  mcps: string[];
  recentEvents: string;
  tone: HealthTone;
}

export interface LogWindowBucket {
  window: string;
  errors: number | null;
  warnings: number | null;
  deferred: number | null;
}

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

export interface TokenSpend {
  input: number;
  output: number;
}

export interface CostCalculationBasis {
  provider: string;
  modelId: string;
  inputRatePer1M: string;
  outputRatePer1M: string;
  inputRateUsdPer1M: number;
  outputRateUsdPer1M: number;
}

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

export interface MonthlyCostRow {
  month: string;
  label: string;
  cost: number;
  partial?: boolean;
  tokens: TokenSpend;
  calculationBases: CostCalculationBasis[];
}

export interface SnapshotMeta {
  collectedAt: string;
  collectedAtLabel: string;
  serverIp: string;
  host: string;
  openclawVersion: string;
  nodeVersion: string;
  npmVersion: string;
}

export interface SnapshotView {
  snapshotMeta: SnapshotMeta;
  dayStatus: DayStatus;
  attentionItems: AttentionItem[];
  flowSummaryCards: FlowSummaryCard[];
  activityTimeline: ActivityTimelineItem[];
  whatsAppChannelStatus: WhatsAppChannelStatus;
  costContextInsight: {
    line: string;
    weeklyLine: string;
  };
  intentLinks: { href: string; label: string }[];
  topMetrics: MetricCard[];
  serviceRows: MonitorItem[];
  serviceHealthSummary: MonitorItem[];
  errorHighlights: ErrorHighlight[];
  agentRows: {
    name: string;
    purpose: string;
    sessions: string;
    trajectories: string;
    lastSeen: string;
    tone: HealthTone;
  }[];
  agentDetails: AgentDetail[];
  timerRows: MonitorItem[];
  cronRows: { name: string; cadence: string; target: string; health: string }[];
  cronCategoryGroups: CronCategoryGroup[];
  stateCards: {
    label: string;
    value: string;
    detail: string;
    icon: SnapshotIconName;
    tone: HealthTone;
  }[];
  logRows: { file: string; sampled: string; sampledLines: number; errors: number | null; deferred: number | null; success: number | null; size: string }[];
  logWindowBuckets: LogWindowBucket[];
  dashboardNotifications: DashboardNotification[];
  sidebarStats: { label: string; value: string; icon: SnapshotIconName }[];
  costDetails: CostInstrumentation;
  gatewayDetails: GatewayResourceMetrics;
  portSummaries: PortSummary[];
  usageChartData: { date: string; cost: number }[];
  agentCostRows: AgentCostRow[];
  costKpiCards: CostKpiCard[];
  monthlyCostYearData: MonthlyCostRow[];
  openAiRates: Record<string, CostCalculationBasis>;
  blendedCostBases: CostCalculationBasis[];
}

export interface OpenClawSnapshotAgent {
  last_seen: string | null;
  model_id: string;
  name: string;
  tokens_used: number;
  tokens: TokenSpend;
  models: Record<string, TokenSpend>;
  daily: Record<string, TokenSpend>;
  daily_models: Record<string, Record<string, TokenSpend>>;
  sessions_count: number;
  trajectories_count: number;
  events_count: number;
}

export interface OpenClawSnapshot {
  schema?: string;
  collected_at: string;
  availability: {
    collector: string;
    monetary_cost: string;
  };
  agents: OpenClawSnapshotAgent[];
  flows: {
    medical: {
      pending: number;
      completed: number;
      approval_statuses: Record<string, number>;
      updated_at: string;
    };
    notes: {
      errors: number;
      proposal_statuses: Record<string, number>;
      updated_at: string;
    };
  };
  gateway: {
    health: {
      status: string;
      latency_ms: number | null;
    };
    service: {
      pid: number;
      state: string;
      substate: string;
      started_at: string;
      memory_current_bytes: number;
      memory_max_bytes: number;
      tasks_current: number;
      tasks_max: number;
      restarts: number;
    };
  };
  whatsapp?: {
    instance_name: string;
    status: string;
    updated_at: string | null;
  };
  logs: {
    name: string;
    size_bytes: number;
    line_count: number;
    error_count: number;
    deferred_count: number;
    success_count: number;
    recent_7d: { lines: number; errors: number; deferred: number; success: number };
    updated_at: string | null;
  }[];
  mcp_servers: string[];
  plugins: string[];
  ports: {
    port: string;
    bind: string;
    process: string;
    exposure: string;
  }[];
  services: { name: string; image: string; state: string }[];
  timers: {
    name: string;
    service: string;
    state: string;
    result: string;
    last_trigger_at: string | null;
    next_due_at: string | null;
  }[];
  crons: { category: string; jobs: number }[];
  tokens: {
    total: number | TokenSpend;
    by_agent: { name: string; tokens_used: number; tokens: TokenSpend }[];
    daily: { date: string; tokens_used: number; tokens: TokenSpend }[];
    monetary_cost: string;
  };
}

export interface OpenClawTokenLedger {
  totals?: Record<string, number>;
  daily?: Record<string, Record<string, number | TokenSpend>>;
  tokens?: {
    totals?: Record<string, TokenSpend>;
    total_models?: Record<string, Record<string, TokenSpend>>;
    daily?: Record<string, Record<string, TokenSpend>>;
    daily_models?: Record<string, Record<string, Record<string, TokenSpend>>>;
  };
}
