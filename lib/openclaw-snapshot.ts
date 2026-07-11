import {
  OPENCLAW_VERSION,
  NODE_VERSION,
  NPM_VERSION,
  SERVER_IP,
  HOST,
  HEALTH_LATENCY_OK_MS,
  agentPurposes,
  agentLabels,
  agentPlugins,
  agentMcps,
  cronCategoryGroups as configCronCategoryGroups,
  timerDetails,
  gatewayHealthEndpoint,
  costProviders,
} from "./openclaw-config";

export * from "./openclaw-snapshot-types";

import {
  SnapshotView,
  HealthTone,
  OpenClawSnapshot,
  OpenClawTokenLedger,
  AgentCostRow,
  CostKpiCard,
  MonthlyCostRow,
  CostCalculationBasis,
  DashboardNotification,
  AttentionItem,
  FlowSummaryCard,
  ActivityTimelineItem,
  WhatsAppChannelStatus,
  TokenSpend,
} from "./openclaw-snapshot-types";
import { PricingTable } from "./pricing";

export function fmtTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(".", ",")}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

function normalizeModelId(modelId: string): string {
  return modelId.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function rateForModel(pricing: PricingTable, modelId: string): CostCalculationBasis | undefined {
  const normalized = normalizeModelId(modelId);
  // Direct key lookup for sanitized model keys such as "gpt55", "gpt54", etc.
  if (pricing[normalized]) return pricing[normalized];
  // Fallback matching by modelId field.
  for (const basis of Object.values(pricing)) {
    if (normalizeModelId(basis.modelId) === normalized) return basis;
  }
  // Heuristic fallback using known model identifiers.
  if (normalized.includes("gpt55") || normalized.includes("gpt55preview") || normalized.includes("gpt5preview")) {
    return pricing.gpt55;
  }
  if (normalized.includes("gpt54") || normalized.includes("codexgpt54") || normalized.includes("gpt54preview")) {
    return pricing.gpt54;
  }
  if (normalized.includes("gpt5mini") || normalized.includes("gpt5minipreview")) {
    return pricing.gpt5Mini;
  }
  if (normalized.includes("claude") || normalized.includes("sonnet") || normalized.includes("anthropic")) {
    return pricing.claudeSonnet46;
  }
  return undefined;
}

export function calculateCost(tokens: TokenSpend, basis: CostCalculationBasis): number {
  const inputCost = (tokens.input / 1_000_000) * basis.inputRateUsdPer1M;
  const outputCost = (tokens.output / 1_000_000) * basis.outputRateUsdPer1M;
  return inputCost + outputCost;
}

function calculateCostForModelId(
  pricing: PricingTable,
  tokens: TokenSpend,
  modelId: string,
): number {
  const basis = rateForModel(pricing, modelId);
  return basis ? calculateCost(tokens, basis) : 0;
}

function formatCurrency(n: number): string {
  return `US$ ${n.toFixed(2).replace(".", ",")}`;
}

function healthToneForGatewayHealth(status: string, latencyMs: number | null): HealthTone {
  if (status === "live") return latencyMs == null ? "warn" : latencyMs <= HEALTH_LATENCY_OK_MS ? "ok" : "warn";
  if (status === "degraded") return "warn";
  return "danger";
}

function healthToneForService(state: string): HealthTone {
  const s = state.toLowerCase();
  if (s.includes("up") || s.includes("running") || s.includes("active")) return "ok";
  if (s.includes("degraded") || s.includes("restarting") || s.includes("planned")) return "warn";
  return "danger";
}

function formatDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return iso;
  }
}

function formatDateOnly(iso: string): string {
  try {
    const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso;
    const d = new Date(safeDate);
    return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return iso;
  }
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} kB`;
  return `${bytes} B`;
}

function bytesToMB(bytes: number): string {
  return `${Math.round(bytes / 1_000_000)} MB`;
}

function bytesToGB(bytes: number): string {
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

function lastSeenLabel(iso: string | null): string {
  if (!iso) return "—";
  return formatDateLabel(iso);
}

function isWhatsAppConnected(snapshot: OpenClawSnapshot): boolean {
  return snapshot.whatsapp?.status === "open";
}

function buildSnapshotMeta(snapshot: OpenClawSnapshot): SnapshotView["snapshotMeta"] {
  return {
    collectedAt: snapshot.collected_at,
    collectedAtLabel: formatDateLabel(snapshot.collected_at),
    serverIp: SERVER_IP,
    host: HOST,
    openclawVersion: OPENCLAW_VERSION,
    nodeVersion: NODE_VERSION,
    npmVersion: NPM_VERSION,
  };
}

function buildDayStatus(snapshot: OpenClawSnapshot): SnapshotView["dayStatus"] {
  const medical = snapshot.flows.medical;
  const notes = snapshot.flows.notes;
  const pending = medical.pending ?? 0;
  const notesErrors = notes.errors ?? 0;
  const whatsappStatus = snapshot.whatsapp?.status ?? "unavailable";
  const waTone = whatsappStatus === "open" ? "ok" : "warn";

  if (waTone !== "ok") {
    const unavailable = whatsappStatus === "unavailable" || whatsappStatus === "unknown";
    return {
      headline: "1 problema ativo",
      summary: unavailable
        ? "Estado do WhatsApp médico indisponível no snapshot."
        : "WhatsApp médico desconectado — agendamentos podem ficar sem resposta automática.",
      tone: "warn",
    };
  }
  if (pending > 0) {
    return {
      headline: `${pending} ${pending === 1 ? "problema ativo" : "problemas ativos"}`,
      summary: `${pending} agendamento${pending === 1 ? "" : "s"} médico${pending === 1 ? "" : "s"} pendente${pending === 1 ? "" : "s"} no momento.`,
      tone: "warn",
    };
  }
  if (notesErrors > 0) {
    return {
      headline: `${notesErrors} ${notesErrors === 1 ? "erro" : "erros"} no fluxo Notes`,
      summary: "Notes apresentou erros no recorte mais recente; revise os logs.",
      tone: "warn",
    };
  }

  return {
    headline: "Tudo certo",
    summary: "Todos os fluxos monitorados estão estáveis no momento.",
    tone: "ok",
  };
}

function buildAttentionItems(snapshot: OpenClawSnapshot): AttentionItem[] {
  const items: AttentionItem[] = [];
  const whatsappStatus = snapshot.whatsapp?.status ?? "unavailable";
  const whatsappConnected = whatsappStatus === "open";
  if (!whatsappConnected) {
    const unavailable = whatsappStatus === "unavailable" || whatsappStatus === "unknown";
    items.push({
      id: "whatsapp-offline",
      label: unavailable ? "Estado do WhatsApp indisponível" : "WhatsApp médico offline",
      count: 1,
      description: unavailable
        ? "Verificar o coletor e o banco da Evolution."
        : "Reconectar para retomar contatos e respostas automáticas.",
      tone: unavailable ? "warn" : "danger",
      notificationId: "evolution-whatsapp-disconnected",
    });
  }
  const pending = snapshot.flows.medical.pending ?? 0;
  if (pending > 0) {
    items.push({
      id: "contact-approvals",
      label: "Aprovações de contato pendentes",
      count: pending,
      description: "Aguardando APROVAR CONTATO no Slack antes do primeiro WhatsApp.",
      tone: "warn",
      href: "/agentes",
    });
  }
  const notesPending = snapshot.flows.notes.proposal_statuses?.pending_review ?? 0;
  if (notesPending > 0) {
    items.push({
      id: "notes-review",
      label: "Propostas de notas para revisar",
      count: notesPending,
      description: "Cards no ClickUp aguardando APROVAR, AJUSTAR ou REPROVAR.",
      tone: "warn",
      href: "/logs",
    });
  }
  return items;
}

function buildFlowSummaryCards(snapshot: OpenClawSnapshot): FlowSummaryCard[] {
  const medical = snapshot.flows.medical;
  const notes = snapshot.flows.notes;
  const pending = medical.pending ?? 0;
  const completed = medical.completed ?? 0;
  const notesPending = notes.proposal_statuses?.pending_review ?? 0;
  const notesErrors = notes.errors ?? 0;
  const whatsappConnected = isWhatsAppConnected(snapshot);
  const marketingAgent = snapshot.agents.find((agent) => agent.name === "agente-marketing");
  const mainAgent = snapshot.agents.find((agent) => agent.name === "main");
  const approvalCount = Object.values(medical.approval_statuses).reduce((sum, count) => sum + count, 0);

  return [
    {
      id: "medico",
      label: "Agendamento médico",
      headline: pending > 0
        ? `${completed} concluídos · ${pending} pendentes`
        : `${completed} ${completed === 1 ? "agendamento concluído" : "agendamentos concluídos"}`,
      detail: `${approvalCount} ${approvalCount === 1 ? "aprovação" : "aprovações"} registrada${approvalCount === 1 ? "" : "s"} · WhatsApp ${whatsappConnected ? "conectado" : "desconectado"}`,
      tone: whatsappConnected ? (pending > 0 ? "warn" : "ok") : "danger",
      href: "/agentes",
    },
    {
      id: "notes",
      label: "Notas de reunião",
      headline: `${notesPending} ${notesPending === 1 ? "proposta aguardando" : "propostas aguardando"} revisão`,
      detail: `${notes.errors ?? 0} ${notes.errors === 1 ? "erro registrado" : "erros registrados"} no estado`,
      tone: notesPending > 0 || notesErrors > 0 ? "warn" : "ok",
      href: "/logs",
    },
    {
      id: "marketing",
      label: "Marketing",
      headline: marketingAgent?.last_seen ? "Atividade observada" : "Sem atividade observada",
      detail: marketingAgent?.last_seen ? `Último registro: ${formatDateLabel(marketingAgent.last_seen)}` : "Último registro: —",
      tone: marketingAgent?.last_seen ? "ok" : "warn",
      href: "/agentes",
    },
    {
      id: "main",
      label: "Cleo principal",
      headline: mainAgent?.last_seen ? "Atividade observada" : "Sem atividade observada",
      detail: mainAgent?.last_seen ? `Último registro: ${formatDateLabel(mainAgent.last_seen)}` : "Último registro: —",
      tone: mainAgent?.last_seen ? "ok" : "warn",
      href: "/gateway",
    },
  ];
}

function buildActivityTimeline(snapshot: OpenClawSnapshot): ActivityTimelineItem[] {
  const medical = snapshot.flows.medical;
  const notes = snapshot.flows.notes;
  const timeline: ActivityTimelineItem[] = [];
  const waTone = isWhatsAppConnected(snapshot) ? "ok" : "warn";

  timeline.push({
    id: "tl-medical",
    time: formatDateLabel(medical.updated_at).split(" ")[1] ?? "—",
    flow: "Médico",
    summary: `${medical.completed} concluídos · ${medical.pending} pendentes`,
    tone: waTone,
  });

  timeline.push({
    id: "tl-notes",
    time: formatDateLabel(notes.updated_at).split(" ")[1] ?? "—",
    flow: "Notas",
    summary: `${notes.proposal_statuses?.pending_review ?? 0} propostas aguardando revisão · ${notes.errors} erros`,
    tone: notes.errors > 0 || (notes.proposal_statuses?.pending_review ?? 0) > 0 ? "warn" : "ok",
  });

  const marketingAgent = snapshot.agents.find((a) => a.name === "agente-marketing");
  if (marketingAgent?.last_seen) {
    timeline.push({
      id: "tl-marketing",
      time: formatDateLabel(marketingAgent.last_seen).split(" ")[1] ?? "—",
      flow: "Marketing",
      summary: "Agente de marketing visto recentemente",
      tone: "ok",
    });
  }

  const mainAgent = snapshot.agents.find((a) => a.name === "main");
  if (mainAgent?.last_seen) {
    timeline.push({
      id: "tl-main",
      time: formatDateLabel(mainAgent.last_seen).split(" ")[1] ?? "—",
      flow: "Principal",
      summary: "Agente principal visto no snapshot",
      tone: "ok",
    });
  }

  return timeline;
}

function buildWhatsAppChannelStatus(snapshot: OpenClawSnapshot): WhatsAppChannelStatus {
  const status = snapshot.whatsapp?.status ?? "unavailable";
  const connected = status === "open";
  const unavailable = status === "unavailable" || status === "unknown";
  return {
    connected,
    instanceLabel: snapshot.whatsapp?.instance_name ?? "—",
    headline: connected ? "Conectado" : unavailable ? "Estado indisponível" : "Desconectado",
    impact: connected
      ? "Instância WhatsApp conectada na Evolution."
      : unavailable
        ? "O coletor não conseguiu obter o estado da instância WhatsApp."
        : "Agendamentos médicos pausados até reconectar o WhatsApp.",
    lastActiveLabel: snapshot.whatsapp?.updated_at
      ? `Estado atualizado: ${formatDateLabel(snapshot.whatsapp.updated_at)}`
      : "Estado atualizado: —",
    tone: connected ? "ok" : unavailable ? "warn" : "danger",
  };
}

function totalTokenSpend(tokens: number | TokenSpend): TokenSpend {
  if (typeof tokens === "number") return { input: tokens, output: 0 };
  return { input: tokens.input ?? 0, output: tokens.output ?? 0 };
}

function buildCostContext(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
): SnapshotView["costContextInsight"] {
  const today = snapshot.collected_at.slice(0, 10);
  const ledgerAvailable = hasLedgerDaily(ledger);
  const totalTokens = ledgerAvailable ? ledgerDayTokens(ledger, today) : totalTokenSpend(snapshot.tokens.total);
  const cost = costForModelUsage(pricing, modelUsageForDates(snapshot, ledger, [today]));
  return {
    line: ledgerAvailable
      ? `Hoje: ${formatCurrency(cost)} — calculado por modelo e dia do JSONL · ${fmtTokens(totalTokens.input + totalTokens.output)} tokens registrados hoje.`
      : `Acumulado no snapshot: ${formatCurrency(cost)} · ${fmtTokens(totalTokens.input + totalTokens.output)} tokens; ledger diário indisponível.`,
    weeklyLine: ledgerAvailable
      ? "A evolução semanal usa somente dias com tokens observados no ledger."
      : "Custo diário indisponível sem ledger de tokens.",
  };
}

function buildTopMetrics(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
): SnapshotView["topMetrics"] {
  const today = snapshot.collected_at.slice(0, 10);
  const ledgerAvailable = hasLedgerDaily(ledger);
  const totalTokens = ledgerAvailable ? ledgerDayTokens(ledger, today) : totalTokenSpend(snapshot.tokens.total);
  const agentCount = snapshot.agents.filter((a) => a.name !== "defaults").length;
  const gatewayOk = snapshot.gateway.health.status === "live";
  const latency = snapshot.gateway.health.latency_ms;
  const cost = ledgerAvailable
    ? ledgerDayCost(snapshot, ledger, pricing, today)
    : snapshot.agents
      .filter((agent) => agent.name !== "defaults")
      .reduce((sum, agent) => sum + costForModelUsage(pricing, snapshotAgentModelUsage(agent)), 0);

  return [
    {
      label: "Tokens",
      value: fmtTokens(totalTokens.input + totalTokens.output),
      detail: `${formatCurrency(cost)} estimados (taxas de referência)`,
      tone: "ok",
      icon: "circle-dollar-sign",
    },
    {
      label: "Agentes",
      value: String(agentCount),
      detail: snapshot.agents.filter((a) => a.name !== "defaults").map((a) => a.name).join(", ") || "—",
      tone: "ok",
      icon: "bot",
    },
    {
      label: "Gateway",
      value: gatewayOk ? "Ativo" : "Inativo",
      detail: `Health ${snapshot.gateway.health.status} · ${latency == null ? "latência indisponível" : `${latency}ms`}`,
      tone: gatewayOk ? "ok" : "danger",
      icon: "heart-pulse",
    },
    {
      label: "Erros registrados",
      value: `${snapshot.flows.notes.errors} erros`,
      detail: "Contador agregado no estado do fluxo Notes; janela temporal não disponível",
      tone: snapshot.flows.notes.errors > 0 ? "warn" : "ok",
      icon: "shield-check",
    },
  ];
}

function buildServiceRows(snapshot: OpenClawSnapshot): SnapshotView["serviceRows"] {
  const rows: SnapshotView["serviceRows"] = [];
  rows.push({
    name: "openclaw-gateway.service",
    status: snapshot.gateway.service.substate || snapshot.gateway.service.state || "running",
    detail: `PID ${snapshot.gateway.service.pid} · MemoryMax ${bytesToGB(snapshot.gateway.service.memory_max_bytes)} · TasksMax ${snapshot.gateway.service.tasks_max}`,
    tone: healthToneForService(snapshot.gateway.service.substate || snapshot.gateway.service.state),
  });

  const evolution = snapshot.services.find((s) => s.name === "evolution-api");
  if (evolution) {
    rows.push({
      name: "Evolution API",
      status: evolution.state,
      detail: `Docker \`evolution-api\` · estado coletado`,
      tone: healthToneForService(evolution.state),
    });
  }
  const evoPg = snapshot.services.find((s) => s.name === "evolution-postgres");
  if (evoPg) {
    rows.push({
      name: "Evolution Postgres",
      status: evoPg.state,
      detail: "Docker `evolution-postgres` · estado coletado",
      tone: healthToneForService(evoPg.state),
    });
  }
  const browserPort = snapshot.ports.find((port) => port.port === "18800");
  rows.push({
    name: "Browser/CDP",
    status: browserPort ? browserPort.exposure : "indisponível",
    detail: browserPort ? `${browserPort.process} ouvindo em ${browserPort.bind}:${browserPort.port}` : "Porta 18800 não observada",
    tone: browserPort ? "ok" : "warn",
  });
  const dashboardPort = snapshot.ports.find((port) => port.port === "3100");
  rows.push({
    name: "Dashboard Next.js",
    status: dashboardPort ? dashboardPort.exposure : "indisponível",
    detail: dashboardPort ? `${dashboardPort.process} ouvindo em ${dashboardPort.bind}:${dashboardPort.port}` : "Porta 3100 não observada",
    tone: dashboardPort ? "ok" : "danger",
  });
  return rows;
}

function buildServiceHealthSummary(snapshot: OpenClawSnapshot): SnapshotView["serviceHealthSummary"] {
  const gatewayTone = healthToneForGatewayHealth(snapshot.gateway.health.status, snapshot.gateway.health.latency_ms);
  const whatsapp = buildWhatsAppChannelStatus(snapshot);
  const dashboardPort = snapshot.ports.find((port) => port.port === "3100");
  return [
    {
      name: "Gateway OpenClaw",
      status: snapshot.gateway.health.status,
      detail: snapshot.gateway.health.latency_ms == null ? "Latência indisponível" : `Health check em ${snapshot.gateway.health.latency_ms}ms`,
      tone: gatewayTone,
    },
    {
      name: "Evolution WhatsApp",
      status: whatsapp.headline,
      detail: `Instância ${whatsapp.instanceLabel}`,
      tone: whatsapp.tone,
    },
    {
      name: "Dashboard",
      status: dashboardPort ? "Online" : "Indisponível",
      detail: dashboardPort ? `${dashboardPort.bind}:${dashboardPort.port}` : "Porta 3100 não observada",
      tone: dashboardPort ? "ok" : "danger",
    },
  ];
}

function buildErrorHighlights(snapshot: OpenClawSnapshot): SnapshotView["errorHighlights"] {
  const notes = snapshot.flows.notes;
  const medical = snapshot.flows.medical;
  const gatewayOk = snapshot.gateway.health.status === "live";
  const whatsappConnected = isWhatsAppConnected(snapshot);
  return [
    { source: "agendamento-notes", summary: `${notes.errors} ${notes.errors === 1 ? "erro" : "erros"} · ${notes.proposal_statuses?.merged ?? 0} propostas merged`, tone: notes.errors > 0 ? "warn" : "ok" },
    { source: "agendamento-medico", summary: `${medical.pending} pendentes · WhatsApp ${whatsappConnected ? "conectado" : "desconectado"}`, tone: whatsappConnected ? "ok" : "warn" },
    { source: "openclaw-gateway", summary: `Health ${snapshot.gateway.health.status} · ${snapshot.gateway.health.latency_ms}ms`, tone: gatewayOk ? "ok" : "danger" },
  ];
}

function buildAgentRows(snapshot: OpenClawSnapshot): SnapshotView["agentRows"] {
  return snapshot.agents
    .filter((a) => a.name !== "defaults")
    .map((agent) => ({
      name: agent.name,
      purpose: agentPurposes[agent.name] ?? "—",
      sessions: String(agent.sessions_count),
      trajectories: String(agent.trajectories_count),
      lastSeen: lastSeenLabel(agent.last_seen),
      tone: agent.last_seen ? "ok" : "warn",
    }));
}

function buildAgentDetails(snapshot: OpenClawSnapshot): SnapshotView["agentDetails"] {
  return snapshot.agents
    .filter((agent) => agent.name !== "defaults")
    .map((agent) => {
      const observedModels = Object.entries(agent.models ?? {})
        .filter(([, tokens]) => (tokens.input ?? 0) + (tokens.output ?? 0) > 0)
        .sort(([, a], [, b]) => (b.input + b.output) - (a.input + a.output))
        .map(([modelId]) => modelId);
      const modelId = observedModels.length > 1
        ? `${observedModels[0]} (dominante) · ${observedModels.slice(1).join(" · ")}`
        : observedModels[0] ?? agent.model_id ?? "—";
      return {
        name: agent.name,
        modelId,
        plugins: agentPlugins[agent.name] ?? ["—"],
        mcps: agentMcps[agent.name] ?? ["—"],
        recentEvents: `${agent.events_count} eventos · ${fmtTokens(agent.tokens_used)} tokens / snapshot`,
        tone: agent.last_seen ? "ok" : "warn",
      };
    });
}

function buildTimerRows(snapshot: OpenClawSnapshot): SnapshotView["timerRows"] {
  return snapshot.timers.map((t) => {
    const normalizedName = t.name.replace(/\.timer$/, "");
    const shortName = normalizedName.replace(/^openclaw-/, "");
    const metadata = timerDetails[t.name] ?? timerDetails[normalizedName] ?? timerDetails[shortName];
    const detail = metadata?.detail ?? `Timer ${t.name}`;
    const cadence = metadata?.cadence ?? "Cadência indisponível";
    return {
      name: t.name,
      status: cadence,
      detail: `${detail} · estado ${t.state} · resultado ${t.result}`,
      tone: healthToneForService(t.state),
    };
  });
}

function buildCronRows(snapshot: OpenClawSnapshot): SnapshotView["cronRows"] {
  return snapshot.crons.map((cron) => ({
    name: cron.category,
    cadence: "—",
    target: `${cron.jobs} ${cron.jobs === 1 ? "job coletado" : "jobs coletados"}`,
    health: "estado individual indisponível",
  }));
}

function buildStateCards(snapshot: OpenClawSnapshot): SnapshotView["stateCards"] {
  const medical = snapshot.flows.medical;
  const notes = snapshot.flows.notes;
  const gatewayOk = snapshot.gateway.health.status === "live";
  return [
    {
      label: "Fluxo médico",
      value: `${medical.pending} pendentes`,
      detail: `${medical.completed} concluídos · ${Object.values(medical.approval_statuses).reduce((a, b) => a + b, 0)} aprovações`,
      icon: "activity",
      tone: gatewayOk ? (medical.pending > 0 ? "warn" : "ok") : "danger",
    },
    {
      label: "Aprovações contato",
      value: String(Object.values(medical.approval_statuses).reduce((a, b) => a + b, 0)),
      detail: Object.entries(medical.approval_statuses)
        .map(([k, v]) => `${v} ${k}`)
        .join(" · ") || "—",
      icon: "list-checks",
      tone: "ok",
    },
    {
      label: "Notes proposals",
      value: String(notes.proposal_statuses?.pending_review ?? 0),
      detail: Object.entries(notes.proposal_statuses)
        .map(([k, v]) => `${v} ${k}`)
        .join(" · ") || "—",
      icon: "file-warning",
      tone: notes.proposal_statuses?.pending_review ?? 0 > 0 ? "warn" : "ok",
    },
    {
      label: "Notes errors",
      value: String(notes.errors),
      detail: "Contador agregado do fluxo Notes",
      icon: "alert-triangle",
      tone: notes.errors > 0 ? "warn" : "ok",
    },
  ];
}

function buildLogRows(snapshot: OpenClawSnapshot): SnapshotView["logRows"] {
  return snapshot.logs.map((log) => ({
    file: log.name,
    sampled: `${log.line_count.toLocaleString("pt-BR")} linhas · atualizado ${log.updated_at ?? "—"}`,
    sampledLines: log.line_count,
    errors: log.error_count,
    deferred: log.deferred_count,
    success: log.success_count,
    size: formatSize(log.size_bytes),
  }));
}

function buildLogWindowBuckets(snapshot: OpenClawSnapshot): SnapshotView["logWindowBuckets"] {
  const recent = snapshot.logs.reduce(
    (total, log) => ({
      errors: total.errors + log.recent_7d.errors,
      deferred: total.deferred + log.recent_7d.deferred,
      lines: total.lines + log.recent_7d.lines,
    }),
    { errors: 0, deferred: 0, lines: 0 },
  );
  return [
    { window: "snapshot", errors: snapshot.flows.notes.errors, warnings: null, deferred: null },
    { window: "7d", errors: recent.errors, warnings: null, deferred: recent.deferred },
  ];
}

function buildDashboardNotifications(snapshot: OpenClawSnapshot): DashboardNotification[] {
  const notifications: DashboardNotification[] = [];
  const status = snapshot.whatsapp?.status ?? "unavailable";
  if (status !== "open") {
    const unavailable = status === "unavailable" || status === "unknown";
    notifications.push({
      id: "evolution-whatsapp-disconnected",
      title: unavailable ? "Estado do WhatsApp indisponível" : "WhatsApp desconectado no Evolution",
      summary: unavailable
        ? "O coletor não conseguiu obter o estado atual da instância WhatsApp."
        : "A instância WhatsApp não está conectada na Evolution.",
      tone: unavailable ? "warn" : "danger",
      detectedAt: formatDateLabel(snapshot.whatsapp?.updated_at ?? snapshot.collected_at),
      source: "snapshot · Evolution Postgres",
      details: [
        { label: "Instância", value: snapshot.whatsapp?.instance_name ?? "—" },
        { label: "Container", value: "evolution-api" },
        { label: "Estado coletado", value: status },
        { label: "Impacto", value: unavailable ? "Estado não confirmado" : "Fluxo médico sem ingestão WhatsApp" },
      ],
      suggestedAction: unavailable
        ? "Verificar o coletor e o banco da Evolution."
        : "Reconectar manualmente pelo Evolution Manager.",
    });
  }
  return notifications;
}

function buildSidebarStats(snapshot: OpenClawSnapshot): SnapshotView["sidebarStats"] {
  return [
    { label: "Timers", value: String(snapshot.timers.length), icon: "timer-reset" },
    { label: "Crons", value: String(snapshot.crons.reduce((a, c) => a + c.jobs, 0)), icon: "clock-3" },
    { label: "Serviços", value: String(snapshot.services.length + 1), icon: "terminal-square" },
  ];
}

function buildCostDetails(pricing: PricingTable): SnapshotView["costDetails"] {
  const providerIds = new Set<string>();
  const modelByProvider = new Map<string, string[]>();
  for (const basis of Object.values(pricing)) {
    const list = modelByProvider.get(basis.provider) ?? [];
    list.push(basis.modelId);
    modelByProvider.set(basis.provider, list);
    providerIds.add(basis.provider);
  }
  for (const provider of costProviders) {
    if (!providerIds.has(provider.id)) {
      modelByProvider.set(provider.id, provider.models);
    }
  }
  return {
    tokenCollection: "Tokens coletados do snapshot real com input e output discriminados.",
    traceSource: "OpenClaw/Codex traces — usage.input e usage.output",
    priceMapStatus: "Taxas de referência em USD por 1M tokens",
    providers: Array.from(modelByProvider.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, models]) => ({ id, models })),
  };
}

function buildGatewayDetails(snapshot: OpenClawSnapshot): SnapshotView["gatewayDetails"] {
  const s = snapshot.gateway.service;
  return {
    pid: String(s.pid),
    memoryCurrent: bytesToMB(s.memory_current_bytes),
    memoryHigh: "—",
    memoryMax: bytesToGB(s.memory_max_bytes),
    tasksCurrent: String(s.tasks_current),
    tasksMax: String(s.tasks_max),
    nRestarts: String(s.restarts),
    healthLatencyMs: snapshot.gateway.health.latency_ms == null ? "—" : String(snapshot.gateway.health.latency_ms),
    healthEndpoint: gatewayHealthEndpoint,
  };
}

function buildPortSummaries(snapshot: OpenClawSnapshot): SnapshotView["portSummaries"] {
  return snapshot.ports.map((p) => ({
    port: p.port,
    bind: p.bind,
    process: p.process,
    exposure: p.exposure,
  }));
}

function last7Days(todayIso: string): string[] {
  const days: string[] = [];
  const d = new Date(`${todayIso}T12:00:00Z`);
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() - i);
    days.push(x.toISOString().slice(0, 10));
  }
  return days;
}

type ModelUsage = Record<string, TokenSpend>;

function costForModelUsage(pricing: PricingTable, usage: ModelUsage): number {
  return Object.entries(usage).reduce((sum, [modelId, tokens]) => {
    return sum + calculateCostForModelId(pricing, tokens, modelId);
  }, 0);
}

function basesForModelUsage(pricing: PricingTable, usage: ModelUsage, fallbackModel?: string): CostCalculationBasis[] {
  const modelIds = Object.keys(usage);
  if (modelIds.length === 0 && fallbackModel) modelIds.push(fallbackModel);
  const bases = modelIds
    .map((modelId) => rateForModel(pricing, modelId))
    .filter((basis): basis is CostCalculationBasis => Boolean(basis));
  return bases;
}

function ledgerDayTokens(ledger: OpenClawTokenLedger | undefined, date: string): TokenSpend {
  const daily = ledger?.tokens?.daily?.[date] ?? ledger?.daily?.[date];
  if (!daily) return { input: 0, output: 0 };
  let input = 0;
  let output = 0;
  for (const spend of Object.values(daily)) {
    if (typeof spend === "number") {
      input += spend;
    } else if (spend && typeof spend === "object") {
      input += (spend as TokenSpend).input ?? 0;
      output += (spend as TokenSpend).output ?? 0;
    }
  }
  return { input, output };
}

function ledgerAgentTokens(ledger: OpenClawTokenLedger | undefined, date: string, agentName: string): TokenSpend {
  const tokens = ledger?.tokens?.daily?.[date]?.[agentName] ?? ledger?.daily?.[date]?.[agentName];
  if (!tokens) return { input: 0, output: 0 };
  if (typeof tokens === "number") return { input: tokens, output: 0 };
  return { input: (tokens as TokenSpend).input ?? 0, output: (tokens as TokenSpend).output ?? 0 };
}

function hasLedgerDaily(ledger: OpenClawTokenLedger | undefined): boolean {
  return Boolean(ledger?.tokens?.daily || ledger?.daily);
}

function snapshotAgentModelUsage(agent: OpenClawSnapshot["agents"][number]): ModelUsage {
  if (agent.models && Object.keys(agent.models).length > 0) return agent.models;
  const tokens = totalTokenSpend(agent.tokens);
  return agent.model_id ? { [agent.model_id]: tokens } : {};
}

function mergeModelUsage(target: ModelUsage, source: ModelUsage): void {
  for (const [modelId, tokens] of Object.entries(source)) {
    const current = target[modelId] ?? { input: 0, output: 0 };
    target[modelId] = {
      input: current.input + (tokens.input ?? 0),
      output: current.output + (tokens.output ?? 0),
    };
  }
}

function modelUsageForDates(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  dates: string[],
): ModelUsage {
  const usage: ModelUsage = {};
  if (!hasLedgerDaily(ledger)) {
    for (const agent of snapshot.agents.filter((item) => item.name !== "defaults")) {
      mergeModelUsage(usage, snapshotAgentModelUsage(agent));
    }
    return usage;
  }
  for (const date of dates) {
    for (const agent of snapshot.agents.filter((item) => item.name !== "defaults")) {
      mergeModelUsage(usage, ledgerAgentModelUsage(ledger, date, agent.name, agent.model_id));
    }
  }
  return usage;
}

function tokensForModelUsage(usage: ModelUsage): TokenSpend {
  return Object.values(usage).reduce(
    (total, tokens) => ({ input: total.input + tokens.input, output: total.output + tokens.output }),
    { input: 0, output: 0 },
  );
}

function datesForMonth(ledger: OpenClawTokenLedger | undefined, month: string): string[] {
  return Object.keys(ledger?.tokens?.daily ?? ledger?.daily ?? {}).filter((date) => date.startsWith(month));
}

function ledgerAgentModelUsage(
  ledger: OpenClawTokenLedger | undefined,
  date: string,
  agentName: string,
  fallbackModel?: string,
): ModelUsage {
  const usage = ledger?.tokens?.daily_models?.[date]?.[agentName];
  if (usage && Object.keys(usage).length > 0) return usage;
  const tokens = ledgerAgentTokens(ledger, date, agentName);
  if ((tokens.input || tokens.output) && fallbackModel) return { [fallbackModel]: tokens };
  return {};
}

function ledgerDayCost(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
  date: string,
): number {
  return snapshot.agents
    .filter((agent) => agent.name !== "defaults")
    .reduce((sum, agent) => {
      const usage = ledgerAgentModelUsage(ledger, date, agent.name, agent.model_id);
      return sum + costForModelUsage(pricing, usage);
    }, 0);
}

function buildAgentCostRows(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
): AgentCostRow[] {
  const today = snapshot.collected_at.slice(0, 10);
  const days = last7Days(today);
  const agents = snapshot.agents.filter((a) => a.name !== "defaults");
  const ledgerAvailable = hasLedgerDaily(ledger);
  const rows = agents.map((agent) => {
    const todayModelUsage = ledgerAvailable
      ? ledgerAgentModelUsage(ledger, today, agent.name, agent.model_id)
      : snapshotAgentModelUsage(agent);
    const todayTokens = Object.values(todayModelUsage).reduce(
      (total, spend) => ({ input: total.input + spend.input, output: total.output + spend.output }),
      { input: 0, output: 0 },
    );

    const tokens7d = { input: 0, output: 0 };
    let cost7d = 0;
    const dailyCosts = days.map((d) => {
      const usage = ledgerAgentModelUsage(ledger, d, agent.name, agent.model_id);
      const spend = Object.values(usage).reduce(
        (total, value) => ({ input: total.input + value.input, output: total.output + value.output }),
        { input: 0, output: 0 },
      );
      tokens7d.input += spend.input;
      tokens7d.output += spend.output;
      const cost = costForModelUsage(pricing, usage);
      cost7d += cost;
      return { date: formatDateOnly(d), cost };
    });

    const costToday = costForModelUsage(pricing, todayModelUsage);
    if (!ledgerAvailable) {
      tokens7d.input = todayTokens.input;
      tokens7d.output = todayTokens.output;
      cost7d = costToday;
      dailyCosts[dailyCosts.length - 1] = { date: "Acumulado", cost: costToday };
    }
    const calculationBases = basesForModelUsage(
      pricing,
      Object.keys(todayModelUsage).length > 0
        ? todayModelUsage
        : ledgerAvailable
          ? {}
          : snapshotAgentModelUsage(agent),
      agent.model_id,
    );

    return {
      agentId: agent.name,
      label: agentLabels[agent.name] ?? agent.name,
      cost7d,
      costToday,
      sharePercent: 0,
      dailyCosts,
      tokens7d,
      tokensToday: todayTokens,
      calculationBases,
    };
  });

  const total = rows.reduce((a, r) => a + r.costToday, 0);
  if (total > 0) {
    const shares = rows.map((r) => (r.costToday / total) * 100);
    let sum = 0;
    for (let i = 0; i < shares.length; i++) {
      const rounded = Math.floor(shares[i]);
      rows[i].sharePercent = rounded;
      sum += rounded;
    }
    const remainder = 100 - sum;
    if (remainder > 0) {
      const indices = shares
        .map((s, i) => ({ i, frac: s - Math.floor(s) }))
        .sort((a, b) => b.frac - a.frac)
        .slice(0, remainder)
        .map((x) => x.i);
      for (const i of indices) {
        rows[i].sharePercent += 1;
      }
    }
  }
  return rows;
}

function currentMonthUsage(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
): { tokens: TokenSpend; days: number } {
  const today = snapshot.collected_at.slice(0, 10);
  const month = today.slice(0, 7);
  const entries = Object.entries(ledger?.tokens?.daily ?? ledger?.daily ?? {}).filter(([date]) =>
    date.startsWith(month),
  );
  if (entries.length === 0) {
    return { tokens: { input: 0, output: 0 }, days: 0 };
  }
  const tokens = { input: 0, output: 0 };
  for (const [, agents] of entries) {
    for (const spend of Object.values(agents)) {
      if (typeof spend === "number") {
        tokens.input += spend;
      } else if (spend && typeof spend === "object") {
        tokens.input += (spend as TokenSpend).input ?? 0;
        tokens.output += (spend as TokenSpend).output ?? 0;
      }
    }
  }
  return { tokens, days: entries.length };
}

function buildUsageChartData(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
): SnapshotView["usageChartData"] {
  const today = snapshot.collected_at.slice(0, 10);
  const days = last7Days(today);
  return days.map((date) => ({
    date: formatDateOnly(date),
    cost: ledgerDayCost(snapshot, ledger, pricing, date),
  }));
}

function buildCostKpiCards(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
): CostKpiCard[] {
  const today = snapshot.collected_at.slice(0, 10);
  const days = last7Days(today);
  const ledgerAvailable = hasLedgerDaily(ledger);
  const todayUsage = modelUsageForDates(snapshot, ledger, [today]);
  const todayTokens = tokensForModelUsage(todayUsage);
  const agentRows = buildAgentCostRows(snapshot, ledger, pricing);
  const todayCost = costForModelUsage(pricing, todayUsage);
  const weekUsage = modelUsageForDates(snapshot, ledger, days);
  const tokens7d = tokensForModelUsage(weekUsage);
  const cost7d = costForModelUsage(pricing, weekUsage);
  const topAgent = [...agentRows].sort((a, b) => b.costToday - a.costToday)[0];
  const yesterday = days[days.length - 2] ?? today;
  const yesterdayUsage = modelUsageForDates(snapshot, ledger, [yesterday]);
  const yesterdayCost = costForModelUsage(pricing, yesterdayUsage);
  const diff = todayCost - yesterdayCost;
  const diffPct = yesterdayCost > 0 ? Math.round((diff / yesterdayCost) * 100) : 0;
  const avg7d = cost7d / Math.max(days.length, 1);
  const aboveAvg = todayCost - avg7d;
  const aboveAvgPct = avg7d > 0 ? Math.round((aboveAvg / avg7d) * 100) : 0;
  const peakDate = days
    .map((date) => ({ date, cost: ledgerAvailable ? ledgerDayCost(snapshot, ledger, pricing, date) : todayCost }))
    .filter((point) => point.cost > 0)
    .sort((a, b) => b.cost - a.cost)[0];
  const peak = peakDate ? { date: formatDateOnly(peakDate.date), cost: peakDate.cost } : undefined;
  const peakUsage = peakDate ? modelUsageForDates(snapshot, ledger, [peakDate.date]) : todayUsage;
  const monthDates = datesForMonth(ledger, today.slice(0, 7));
  const monthUsage = currentMonthUsage(snapshot, ledger);
  const monthUsageByModel = ledgerAvailable ? modelUsageForDates(snapshot, ledger, monthDates) : {};
  const monthCost = costForModelUsage(pricing, monthUsageByModel);
  const registeredDays = days.filter((date) => {
    const tokens = ledgerDayTokens(ledger, date);
    return tokens.input + tokens.output > 0;
  }).length;
  const todayBases = basesForModelUsage(pricing, todayUsage);
  const weekBases = basesForModelUsage(pricing, weekUsage);
  const monthBases = basesForModelUsage(pricing, monthUsageByModel);
  const peakBases = basesForModelUsage(pricing, peakUsage);

  return [
    {
      id: "cost-today",
      label: "Custo hoje",
      value: formatCurrency(todayCost),
      comparison: `${diff >= 0 ? "+" : ""}${diffPct}% vs ontem`,
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
      modalTitle: "Custo de hoje",
      modalDetails: [
        { label: "Total", value: formatCurrency(todayCost) },
        { label: "Ontem", value: formatCurrency(yesterdayCost) },
        { label: "Variação", value: `${diff >= 0 ? "+" : ""}${formatCurrency(diff)} (${diff >= 0 ? "+" : ""}${diffPct}%)` },
        { label: "Agente mais caro", value: topAgent ? `${topAgent.label} · ${formatCurrency(topAgent.costToday)}` : "—" },
        { label: "Média dos últimos 7 dias", value: formatCurrency(avg7d) },
        { label: "Acima da média", value: `${aboveAvg >= 0 ? "+" : ""}${formatCurrency(aboveAvg)} (${aboveAvgPct}%)` },
      ],
      tokens: todayTokens,
      calculationBases: todayBases,
    },
    {
      id: "cost-7d",
      label: "Custo 7 dias",
      value: formatCurrency(cost7d),
      comparison: `Dias registrados: ${registeredDays}/${days.length}`,
      trend: "flat",
      modalTitle: "Custo dos últimos 7 dias",
      modalDetails: [
        { label: "Total 7 dias", value: formatCurrency(cost7d) },
        { label: "Tokens", value: fmtTokens(tokens7d.input + tokens7d.output) },
        { label: "Período", value: `${formatDateOnly(days[0])} – ${formatDateOnly(days[6])}` },
      ],
      tokens: tokens7d,
      calculationBases: weekBases,
    },
    {
      id: "cost-month",
      label: "Custo do mês",
      value: formatCurrency(monthCost),
      comparison: `${formatDateOnly(today)} · parcial`,
      trend: "flat",
      modalTitle: "Custo do mês atual",
      modalDetails: [
        { label: "Mês", value: new Date(today).toLocaleString("pt-BR", { month: "long", year: "numeric" }) },
        { label: "Acumulado", value: formatCurrency(monthCost) },
        { label: "Dias registrados", value: String(monthUsage.days) },
      ],
      tokens: monthUsage.tokens,
      calculationBases: monthBases,
    },
    {
      id: "cost-peak",
      label: "Dia mais caro",
      value: peak ? peak.date : formatDateOnly(today),
      comparison: peak ? formatCurrency(peak.cost) : formatCurrency(todayCost),
      trend: "up",
      modalTitle: "Dia de pico de custo",
      modalDetails: [
        { label: "Data", value: peak ? peak.date : formatDateOnly(today) },
        { label: "Custo total", value: peak ? formatCurrency(peak.cost) : formatCurrency(todayCost) },
      ],
      tokens: tokensForModelUsage(peakUsage),
      calculationBases: peakBases,
    },
  ];
}

function buildMonthlyCostYearData(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
): MonthlyCostRow[] {
  const daily = ledger?.tokens?.daily ?? ledger?.daily ?? {};
  const tokenByMonth = new Map<string, TokenSpend>();
  const costByMonth = new Map<string, number>();
  const modelUsageByMonth = new Map<string, ModelUsage>();
  for (const [date, agents] of Object.entries(daily)) {
    const month = date.slice(0, 7);
    const spend = Object.values(agents).reduce<TokenSpend>(
      (total, value) => {
        const tokens: TokenSpend = typeof value === "number"
          ? { input: value, output: 0 }
          : { input: value.input ?? 0, output: value.output ?? 0 };
        return { input: total.input + tokens.input, output: total.output + tokens.output };
      },
      { input: 0, output: 0 },
    );
    const existing = tokenByMonth.get(month) ?? { input: 0, output: 0 };
    tokenByMonth.set(month, { input: existing.input + spend.input, output: existing.output + spend.output });
    const monthUsage = modelUsageByMonth.get(month) ?? {};
    mergeModelUsage(monthUsage, modelUsageForDates(snapshot, ledger, [date]));
    modelUsageByMonth.set(month, monthUsage);
    costByMonth.set(month, (costByMonth.get(month) ?? 0) + ledgerDayCost(snapshot, ledger, pricing, date));
  }

  return Array.from(tokenByMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, tokens]) => ({
      month,
      label: new Date(`${month}-01T12:00:00Z`)
        .toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })
        .replace(".", ""),
      cost: costByMonth.get(month) ?? 0,
      partial: month === snapshot.collected_at.slice(0, 7) || undefined,
      tokens,
      calculationBases: basesForModelUsage(pricing, modelUsageByMonth.get(month) ?? {}),
    }));
}

export function buildSnapshotView(
  snapshot: OpenClawSnapshot,
  ledger: OpenClawTokenLedger | undefined,
  pricing: PricingTable,
): SnapshotView {
  const agentRows = buildAgentCostRows(snapshot, ledger, pricing);
  const costKpiCards = buildCostKpiCards(snapshot, ledger, pricing);
  const basisList = Object.values(pricing).sort((a, b) => a.modelId.localeCompare(b.modelId));
  return {
    snapshotMeta: buildSnapshotMeta(snapshot),
    dayStatus: buildDayStatus(snapshot),
    attentionItems: buildAttentionItems(snapshot),
    flowSummaryCards: buildFlowSummaryCards(snapshot),
    activityTimeline: buildActivityTimeline(snapshot),
    whatsAppChannelStatus: buildWhatsAppChannelStatus(snapshot),
    costContextInsight: buildCostContext(snapshot, ledger, pricing),
    intentLinks: [
      { href: "/agentes", label: "Ver aprovações pendentes" },
      { href: "/custos", label: "Ver custos do mês" },
      { href: "/gateway", label: "Ver status do WhatsApp" },
      { href: "/logs", label: "Ver atividade recente" },
    ],
    topMetrics: buildTopMetrics(snapshot, ledger, pricing),
    serviceRows: buildServiceRows(snapshot),
    serviceHealthSummary: buildServiceHealthSummary(snapshot),
    errorHighlights: buildErrorHighlights(snapshot),
    agentRows: buildAgentRows(snapshot),
    agentDetails: buildAgentDetails(snapshot),
    timerRows: buildTimerRows(snapshot),
    cronRows: buildCronRows(snapshot),
    cronCategoryGroups: configCronCategoryGroups,
    stateCards: buildStateCards(snapshot),
    logRows: buildLogRows(snapshot),
    logWindowBuckets: buildLogWindowBuckets(snapshot),
    dashboardNotifications: buildDashboardNotifications(snapshot),
    sidebarStats: buildSidebarStats(snapshot),
    costDetails: buildCostDetails(pricing),
    gatewayDetails: buildGatewayDetails(snapshot),
    portSummaries: buildPortSummaries(snapshot),
    usageChartData: buildUsageChartData(snapshot, ledger, pricing),
    agentCostRows: agentRows,
    costKpiCards,
    monthlyCostYearData: buildMonthlyCostYearData(snapshot, ledger, pricing),
    openAiRates: pricing as Record<string, CostCalculationBasis>,
    blendedCostBases: basisList,
  };
}

export const openAiRates = {};
export const blendedCostBases: CostCalculationBasis[] = [];
