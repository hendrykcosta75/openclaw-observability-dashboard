"use client";

import React from "react";
import { Card } from "@heroui/react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  ScrollText,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  agentRows,
  costPlan,
  cronRows,
  deploymentPlan,
  logRows,
  navSections,
  serviceRows,
  sidebarStats,
  snapshotMeta,
  stateCards,
  timerRows,
  topMetrics,
  type HealthTone,
} from "@/lib/openclaw-snapshot";

const mono = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } as const;

const toneStyles: Record<HealthTone, { text: string; bg: string; border: string; dot: string; label: string }> = {
  ok: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "text-emerald-400", label: "OK" },
  warn: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "text-amber-400", label: "Atenção" },
  danger: { text: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/20", dot: "text-red-400", label: "Crítico" },
  planned: { text: "text-[#D4835A]", bg: "bg-[rgba(255,107,44,0.08)]", border: "border-[rgba(255,107,44,0.18)]", dot: "text-[#D4835A]", label: "Planejado" },
};

function StatusPill({ tone, label }: { tone: HealthTone; label?: string }) {
  const s = toneStyles[tone];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] ${s.bg} ${s.border} ${s.text}`} style={mono}>
      <span className={`status-dot ${s.dot}`} />
      {label ?? s.label}
    </span>
  );
}

function SectionTitle({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-subtle" style={mono}>
          <Icon size={13} className="text-[#D4835A]" />
          {eyebrow}
        </div>
        <h2 className="text-xl font-semibold text-heading" style={mono}>{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-subtle">{description}</p>
      </div>
      <a href="#plano" className="btn-neu-ghost inline-flex items-center gap-1 self-start sm:self-auto">
        Ver plano <ChevronRight size={14} />
      </a>
    </div>
  );
}

function MetricTile({ metric }: { metric: (typeof topMetrics)[number] }) {
  const Icon = metric.icon;
  return (
    <Card className="min-h-[154px] p-4">
      <Card.Header className="flex flex-row items-start justify-between gap-3 p-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(255,107,44,0.08)] text-[#D4835A] glow-orange">
          <Icon size={18} />
        </div>
        <StatusPill tone={metric.tone} />
      </Card.Header>
      <Card.Content className="mt-4 p-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-subtle" style={mono}>{metric.label}</p>
        <div className="mt-2 text-2xl font-semibold text-heading" style={mono}>{metric.value}</div>
        <p className="mt-2 text-xs leading-relaxed text-subtle">{metric.detail}</p>
        {typeof metric.progress === "number" && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-dim">
            <div className="h-full rounded-full bg-gradient-to-r from-[#D4835A] to-[#ff8533]" style={{ width: `${metric.progress}%` }} />
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

function Sidebar() {
  return (
    <aside
      className="hidden h-screen w-[248px] shrink-0 flex-col border-r border-border-dim lg:flex"
      style={{
        background: "rgba(14, 14, 14, 0.85)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.4), 1px 0 0 rgba(255,255,255,0.02)",
      }}
    >
      <div className="border-b border-border-dim p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(255,107,44,0.08)] text-[#D4835A] glow-orange-strong">
            <Sparkles size={19} />
          </div>
          <div>
            <p className="text-gradient text-[13px] font-bold uppercase tracking-[0.18em]" style={mono}>OpenClaw</p>
            <p className="text-[11px] text-subtle" style={mono}>Observability</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section, sectionIndex) => (
          <div key={section.label} className={sectionIndex > 0 ? "mt-6" : undefined}>
            <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-subtle" style={mono}>{section.label}</p>
            <ul className="space-y-1">
              {section.items.map((item, idx) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className={`flex items-center gap-2.5 px-3 py-2 text-[12px] transition-all ${idx === 0 && sectionIndex === 0 ? "sidebar-item-active" : "rounded-[10px] text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[rgba(255,255,255,0.88)]"}`} style={mono}>
                    <LayoutDashboard size={14} className="opacity-70" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border-dim p-3">
        <div className="grid grid-cols-3 gap-2">
          {sidebarStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-[12px] bg-dim p-2 text-center">
                <Icon size={14} className="mx-auto mb-1 text-[#D4835A]" />
                <div className="text-[13px] font-semibold text-heading" style={mono}>{stat.value}</div>
                <div className="text-[9px] text-subtle" style={mono}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-dim px-4 lg:px-6"
      style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-gradient text-[13px] font-bold uppercase tracking-[2px]" style={mono}>Painel</span>
        <span className="hidden rounded-full border border-border-dim bg-dim px-2.5 py-1 text-[11px] text-subtle sm:inline-flex" style={mono}>
          snapshot {snapshotMeta.collectedAt}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill tone="ok" label="Gateway 200" />
        <span className="hidden rounded-full border border-border-dim bg-dim px-2.5 py-1 text-[11px] text-subtle md:inline-flex" style={mono}>{snapshotMeta.serverIp}</span>
      </div>
    </header>
  );
}

function ServicesPanel() {
  return (
    <Card className="p-4 lg:col-span-7">
      <Card.Header className="flex flex-row items-center justify-between p-0">
        <div>
          <Card.Title className="text-base text-heading" style={mono}>Serviços e portas</Card.Title>
          <Card.Description className="text-xs text-subtle">Gateway privado, Evolution público e proxy do dashboard.</Card.Description>
        </div>
        <Server size={18} className="text-[#D4835A]" />
      </Card.Header>
      <Card.Content className="mt-4 space-y-3 p-0">
        {serviceRows.map((row) => (
          <div key={row.name} className="flex flex-col gap-2 rounded-[14px] border border-border-dim bg-dim/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-heading" style={mono}>{row.name}</p>
              <p className="mt-1 text-xs text-subtle">{row.detail}</p>
            </div>
            <StatusPill tone={row.tone} label={row.status} />
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

function CostPanel() {
  return (
    <Card id="custos" className="p-4 lg:col-span-5">
      <Card.Header className="flex flex-row items-start justify-between p-0">
        <div>
          <Card.Title className="text-base text-heading" style={mono}>Custos</Card.Title>
          <Card.Description className="text-xs text-subtle">Primeira fase mostra fontes; valores reais entram após instrumentação.</Card.Description>
        </div>
        <CircleDollarSign size={18} className="text-[#D4835A]" />
      </Card.Header>
      <Card.Content className="mt-4 space-y-3 p-0">
        {costPlan.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="rounded-[14px] border border-[rgba(255,107,44,0.12)] bg-[rgba(255,107,44,0.04)] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-[#D4835A]" />
                  <p className="text-sm text-heading" style={mono}>{item.name}</p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#D4835A]" style={mono}>{item.status}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-subtle">{item.detail}</p>
            </div>
          );
        })}
      </Card.Content>
    </Card>
  );
}

function CronsAndTimers() {
  return (
    <section id="crons" className="space-y-5">
      <SectionTitle eyebrow="Automação" title="Crons e timers" description="Cadências ativas, watchdogs e jobs com wrapper seguro." icon={Clock3} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <Card.Header className="p-0">
            <Card.Title className="text-base text-heading" style={mono}>Crons de usuário</Card.Title>
            <Card.Description className="text-xs text-subtle">7 jobs ativos, todos resumidos sem argumentos sensíveis.</Card.Description>
          </Card.Header>
          <Card.Content className="mt-4 overflow-hidden rounded-[14px] border border-border-dim p-0">
            {cronRows.map((row, index) => (
              <div key={row.name} className={`grid grid-cols-[1fr_auto] gap-3 p-3 ${index > 0 ? "border-t border-border-dim" : ""}`}>
                <div>
                  <p className="text-sm text-heading" style={mono}>{row.name}</p>
                  <p className="mt-1 text-xs text-subtle">{row.target}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#D4835A]" style={mono}>{row.cadence}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>{row.health}</p>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card className="p-4">
          <Card.Header className="p-0">
            <Card.Title className="text-base text-heading" style={mono}>Timers systemd</Card.Title>
            <Card.Description className="text-xs text-subtle">Watchdogs e reapers que mantêm o gateway saudável.</Card.Description>
          </Card.Header>
          <Card.Content className="mt-4 space-y-3 p-0">
            {timerRows.map((timer) => (
              <div key={timer.name} className="flex items-center justify-between gap-3 rounded-[14px] border border-border-dim bg-dim/50 p-3">
                <div>
                  <p className="text-sm text-heading" style={mono}>{timer.name}</p>
                  <p className="mt-1 text-xs text-subtle">{timer.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-[#D4835A]" style={mono}>{timer.status}</span>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>
    </section>
  );
}

function AgentsPanel() {
  return (
    <section id="agentes" className="space-y-5">
      <SectionTitle eyebrow="OpenClaw" title="Agentes" description="Sessões, trajetórias e última atividade por agente observado." icon={Bot} />
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.1fr_1.6fr_.55fr_.65fr_.85fr] gap-3 border-b border-border-dim bg-dim px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-subtle" style={mono}>
          <span>Agente</span><span>Função</span><span>Sessões</span><span>Traj.</span><span>Último sinal</span>
        </div>
        {agentRows.map((agent, index) => (
          <div key={agent.name} className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.1fr_1.6fr_.55fr_.65fr_.85fr] ${index > 0 ? "border-t border-border-dim" : ""}`}>
            <div className="flex items-center gap-2">
              <StatusPill tone={agent.tone} label={agent.name} />
            </div>
            <p className="text-sm text-body">{agent.purpose}</p>
            <p className="text-sm text-heading" style={mono}>{agent.sessions}</p>
            <p className="text-sm text-heading" style={mono}>{agent.trajectories}</p>
            <p className="text-xs text-subtle" style={mono}>{agent.lastSeen}</p>
          </div>
        ))}
      </Card>
    </section>
  );
}

function LogsPanel() {
  return (
    <section id="logs" className="space-y-5">
      <SectionTitle eyebrow="Incidentes" title="Erros, logs e estados" description="Contadores agregados; logs brutos ficam fora do dashboard público." icon={ScrollText} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stateCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4">
              <Card.Header className="flex flex-row items-center justify-between p-0">
                <Icon size={17} className="text-[#D4835A]" />
                <StatusPill tone={card.tone} />
              </Card.Header>
              <Card.Content className="mt-4 p-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-subtle" style={mono}>{card.label}</p>
                <p className="mt-2 text-xl font-semibold text-heading" style={mono}>{card.value}</p>
                <p className="mt-2 text-xs text-subtle">{card.detail}</p>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.6fr_.7fr_.5fr_.6fr_.6fr] gap-3 border-b border-border-dim bg-dim px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-subtle" style={mono}>
          <span>Fonte</span><span>Amostra</span><span>Erros</span><span>Deferred</span><span>Sucesso</span>
        </div>
        {logRows.map((row, index) => (
          <div key={row.file} className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.6fr_.7fr_.5fr_.6fr_.6fr] ${index > 0 ? "border-t border-border-dim" : ""}`}>
            <div>
              <p className="text-sm text-heading" style={mono}>{row.file}</p>
              <p className="mt-1 text-xs text-subtle">{row.size}</p>
            </div>
            <p className="text-sm text-body" style={mono}>{row.sampled}</p>
            <p className="text-sm text-emerald-300" style={mono}>{row.errors}</p>
            <p className="text-sm text-emerald-300" style={mono}>{row.deferred}</p>
            <p className="text-sm text-[#D4835A]" style={mono}>{row.success}</p>
          </div>
        ))}
      </Card>
    </section>
  );
}

function PlanPanel() {
  return (
    <section id="plano" className="space-y-5">
      <SectionTitle eyebrow="Harness" title="Plano de evolução" description="A entrega atual é layout público; as próximas fases adicionam coleta viva e custo real." icon={ListChecks} />
      <div className="grid gap-4 lg:grid-cols-4">
        {deploymentPlan.map((item, idx) => (
          <Card key={item.step} className="p-4">
            <Card.Header className="flex flex-row items-center justify-between p-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dim text-[#D4835A]" style={mono}>{idx + 1}</div>
              <span className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>{item.status}</span>
            </Card.Header>
            <Card.Content className="mt-4 p-0">
              <p className="text-base text-heading" style={mono}>{item.step}</p>
              <p className="mt-2 text-xs leading-relaxed text-subtle">{item.detail}</p>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-app text-body">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="decorative-orb" style={{ width: 420, height: 420, top: -170, right: -160, opacity: 0.3 }} />
        <div className="decorative-orb" style={{ width: 300, height: 300, top: -120, left: -120, opacity: 0.15 }} />
        <div className="decorative-orb" style={{ width: 260, height: 260, bottom: 160, left: -100, opacity: 0.14 }} />
        <Header />
        <main className="relative z-10 flex-1 overflow-y-auto p-5 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-10">
            <section id="overview" className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(255,107,44,0.14)] bg-[rgba(255,107,44,0.06)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#D4835A]" style={mono}>
                    <LockKeyhole size={12} /> sem segredos · sem PII · sem logs brutos
                  </div>
                  <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-heading md:text-5xl" style={mono}>
                    OpenClaw <span className="text-gradient">Observability</span> Command Center
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-subtle md:text-base">
                    Primeiro layout do dashboard de custos, crons, agentes, erros, logs e gateway. O visual segue o Baisync; os dados atuais vêm do inventário sanitizado do VPS.
                  </p>
                </div>
                <Card className="p-4">
                  <Card.Header className="flex flex-row items-center justify-between p-0">
                    <div>
                      <Card.Title className="text-base text-heading" style={mono}>Fonte do snapshot</Card.Title>
                      <Card.Description className="text-xs text-subtle">Coleta read-only via SSH no OpenClaw.</Card.Description>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </Card.Header>
                  <Card.Content className="mt-4 space-y-2 p-0 text-xs text-subtle" style={mono}>
                    <div className="flex justify-between gap-3"><span>Host</span><span className="text-heading">{snapshotMeta.host}</span></div>
                    <div className="flex justify-between gap-3"><span>IP</span><span className="text-heading">{snapshotMeta.serverIp}</span></div>
                    <div className="flex justify-between gap-3"><span>OpenClaw</span><span className="text-heading">2026.5.22</span></div>
                    <div className="pt-2 text-[11px] leading-relaxed text-subtle">{snapshotMeta.safety}</div>
                  </Card.Content>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {topMetrics.map((metric) => <MetricTile key={metric.label} metric={metric} />)}
              </div>
            </section>

            <section id="gateway" className="space-y-5">
              <SectionTitle eyebrow="Gateway" title="Saúde dos serviços" description="Resumo operacional do OpenClaw gateway, Docker e portas sem expor a UI interna." icon={HeartPulse} />
              <div className="grid gap-4 lg:grid-cols-12">
                <ServicesPanel />
                <CostPanel />
              </div>
            </section>

            <CronsAndTimers />
            <AgentsPanel />
            <LogsPanel />
            <PlanPanel />

            <section id="coleta-segura" className="pb-8">
              <Card className="p-4">
                <Card.Content className="flex flex-col gap-4 p-0 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[rgba(255,107,44,0.08)] text-[#D4835A]">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-base text-heading" style={mono}>Pronto para a fase de coleta viva</p>
                      <p className="mt-1 max-w-3xl text-xs leading-relaxed text-subtle">
                        O harness já define as regras de coleta segura. A próxima iteração deve gerar JSON sanitizado por timer, alimentar o Next.js e manter o gateway OpenClaw em loopback.
                      </p>
                    </div>
                  </div>
                  <a href="#plano" className="btn-neu inline-flex items-center gap-2 self-start md:self-auto">
                    Plano técnico <ArrowUpRight size={14} />
                  </a>
                </Card.Content>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
