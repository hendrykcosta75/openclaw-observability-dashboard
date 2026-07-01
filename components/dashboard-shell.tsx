"use client";

import React from "react";
import Image from "next/image";
import { Button, Card, Dropdown } from "@heroui/react";
import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CircleDot,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Server,
} from "lucide-react";
import {
  agentRows,
  cronRows,
  logRows,
  serviceRows,
  sidebarStats,
  timerRows,
  topMetrics,
  type HealthTone,
} from "@/lib/openclaw-snapshot";

const mono = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } as const;

const usageData = [
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

function fmtChartDate(iso: string) {
  const parts = iso.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return iso;
}

const sidebarNav = [
  { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
  { label: "Logs", href: "#logs", icon: ScrollText },
  { label: "Agentes", href: "#agentes", icon: Bot },
  { label: "Gateway", href: "#gateway", icon: HeartPulse },
  { label: "Crons", href: "#crons", icon: Clock3 },
  { label: "Custos", href: "#custos", icon: CircleDollarSign },
];

const toneIconStyles: Record<HealthTone, { text: string; label: string; icon: React.ElementType }> = {
  ok: { text: "text-emerald-400", label: "operational", icon: CheckCircle2 },
  warn: { text: "text-[#D4835A]", label: "watch", icon: AlertTriangle },
  danger: { text: "text-red-400", label: "incident", icon: AlertTriangle },
  planned: { text: "text-[#D4835A]", label: "planned", icon: CircleDot },
};

function HealthMark({ tone, label }: { tone: HealthTone; label?: string }) {
  const s = toneIconStyles[tone];
  const Icon = s.icon;
  return (
    <span aria-label={label ?? s.label} title={label ?? s.label} className={`inline-flex h-7 w-7 items-center justify-center ${s.text}`}>
      <Icon size={16} strokeWidth={1.9} />
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
    </div>
  );
}

function MetricTile({ metric, index }: { metric: (typeof topMetrics)[number]; index: number }) {
  const Icon = metric.icon;
  return (
    <Card data-testid="top-metric-card" className={`glass-card relative overflow-hidden p-4 ${index === 0 ? "glow-orange" : ""}`}>
      <Card.Header className="flex flex-row items-center justify-between p-0 pb-1">
        <p className="text-sm font-medium text-subtle">{metric.label}</p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,107,44,0.08)]">
          <Icon size={16} className={index === 0 ? "text-[#ff6b2c]" : index === 1 ? "text-emerald-400" : index === 2 ? "text-blue-400" : "text-purple-400"} />
        </div>
      </Card.Header>
      <Card.Content className="p-0">
        <div className="text-xl font-bold text-heading" style={mono}>{metric.value}</div>
        <p className="text-xs text-subtle">{metric.detail}</p>
        {typeof metric.progress === "number" && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dim">
            <div className="h-full rounded-full bg-gradient-to-r from-[#D4835A] to-[#ff8533]" style={{ width: `${metric.progress}%` }} />
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar navegação"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] shrink-0 flex-col border-r border-border-dim transition-transform duration-200 lg:static lg:h-screen lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "rgba(14, 14, 14, 0.85)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4), 1px 0 0 rgba(255,255,255,0.02)",
        }}
      >
      <div className="border-b border-border-dim p-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-[14px] border border-[rgba(255,107,44,0.16)] bg-[rgba(255,107,44,0.08)] glow-orange-strong">
            <Image src="/assets/openclaw-profile.jpg" alt="OpenClaw" fill sizes="40px" className="object-cover" priority />
          </div>
          <div>
            <p className="text-gradient text-[13px] font-bold uppercase tracking-[0.18em]" style={mono}>OpenClaw</p>
            <p className="text-[11px] text-subtle" style={mono}>Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
        <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-subtle" style={mono}>Monitoramento</p>
        <ul className="space-y-1">
          {sidebarNav.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <a href={item.href} onClick={onClose} className={`flex items-center gap-2.5 px-3 py-2 text-[12px] transition-all ${index === 0 ? "sidebar-item-active" : "rounded-[10px] text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[rgba(255,255,255,0.88)]"}`} style={mono}>
                  <Icon size={14} className="opacity-70" />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
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
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:px-6"
      style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-3">
        <Button isIconOnly size="sm" variant="ghost" aria-label="Abrir navegação" className="h-10 w-10 min-w-10 rounded-full border-none text-subtle transition-colors hover:bg-[rgba(255,107,44,0.06)] hover:text-heading lg:hidden" onPress={onMenuClick}>
          <Menu size={19} />
        </Button>
        <span className="text-gradient text-[13px] font-bold uppercase tracking-[2px]" style={mono}>Painel</span>
      </div>
      <div className="flex items-center gap-2">
        <Button isIconOnly size="sm" variant="ghost" aria-label="Notificações" className="h-9 w-9 min-w-9 rounded-full border-none text-subtle transition-colors hover:bg-[rgba(255,107,44,0.06)] hover:text-heading">
          <Bell size={17} />
        </Button>
        <Dropdown>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Perfil" className="h-9 w-9 min-w-9 rounded-full border-none text-subtle transition-colors hover:bg-[rgba(255,107,44,0.06)] hover:text-heading">
            <span className="relative h-7 w-7 overflow-hidden rounded-full border border-[rgba(255,107,44,0.16)]">
              <Image src="/assets/openclaw-profile.jpg" alt="Perfil OpenClaw" fill sizes="28px" className="object-cover" />
            </span>
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu aria-label="Profile actions" onAction={(key) => {
              if (key === "logout") void handleLogout();
            }}>
              <Dropdown.Item id="profile" textValue="OpenClaw dashboard profile" className="h-14 gap-2">
                <p className="font-semibold">OpenClaw</p>
                <p className="font-semibold text-subtle">Dashboard</p>
              </Dropdown.Item>
              <Dropdown.Item id="logout" textValue="Sair" variant="danger">
                <div className="flex items-center gap-2">
                  <LogOut size={14} />
                  Sair
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}

function ServicesPanel() {
  return (
    <Card className="p-4">
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
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-subtle" style={mono}>
              <span>{row.status}</span>
              <HealthMark tone={row.tone} />
            </div>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

function UsagePanel() {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const values = usageData.map((d) => d.cost);
  const max = Math.max(...values, 1);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const w = 510;
  const h = 170;
  const padX = 5;
  const padY = 10;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const points = values.map((v, i) => ({
    x: padX + (i / Math.max(values.length - 1, 1)) * chartW,
    y: padY + chartH - (v / max) * chartH,
  }));
  const linePath = points.length > 1
    ? points.slice(1).reduce((path, point, i) => {
        const prev = points[i];
        const cpx = (prev.x + point.x) / 2;
        return `${path} C${cpx},${prev.y} ${cpx},${point.y} ${point.x},${point.y}`;
      }, `M${points[0].x},${points[0].y}`)
    : "";
  const areaPath = linePath ? `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z` : "";
  const labelIndices = [0, 4, 9, usageData.length - 1];

  return (
    <Card id="custos" className="p-6">
      <Card.Header className="mb-4 p-0">
        <div>
          <Card.Title className="text-base font-semibold text-heading">Custo ao Longo do Tempo</Card.Title>
          <Card.Description className="text-sm text-subtle" style={mono}>Valores mockados em reais — últimos 14 dias</Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="p-0">
        <div className="relative" style={{ height: 180 }}>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "100%", display: "block" }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="openclawUsageAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8712A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#E8712A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1={h * 0.25} x2={w} y2={h * 0.25} stroke="rgba(255,255,255,0.03)" />
            <line x1="0" y1={h * 0.5} x2={w} y2={h * 0.5} stroke="rgba(255,255,255,0.03)" />
            <line x1="0" y1={h * 0.75} x2={w} y2={h * 0.75} stroke="rgba(255,255,255,0.03)" />
            {areaPath && <path d={areaPath} fill="url(#openclawUsageAreaGrad)" />}
            {linePath && <path d={linePath} fill="none" stroke="#D4835A" strokeWidth="2" />}
            {points.map((p, i) => (
              <rect
                key={usageData[i].date}
                x={p.x - w / values.length / 2}
                y={0}
                width={w / values.length}
                height={h}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            ))}
          </svg>

          {labelIndices.map((idx) => {
            const p = points[idx];
            const isLast = idx === usageData.length - 1;
            return (
              <div
                key={usageData[idx].date}
                className="absolute pointer-events-none"
                style={{
                  left: `${(p.x / w) * 100}%`,
                  top: `${(p.y / h) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isLast ? "#D4835A" : "#1E1E1E",
                  border: isLast ? "none" : "1.5px solid #D4835A",
                }}
              />
            );
          })}

          {hoverIdx !== null && points[hoverIdx] && (
            <div
              className="absolute pointer-events-none z-10 rounded-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap"
              style={{
                left: `${(points[hoverIdx].x / w) * 100}%`,
                top: `${(points[hoverIdx].y / h) * 100}%`,
                transform: "translate(-50%, -130%)",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                color: "#f0f0f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              <span style={{ color: "#D4835A", fontWeight: 600 }}>{fmt(values[hoverIdx])}</span>
              <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>{fmtChartDate(usageData[hoverIdx].date)}</span>
            </div>
          )}

          <div className="mt-1 flex justify-between px-0">
            {labelIndices.map((idx) => (
              <span key={usageData[idx].date} className="text-[9px]" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono', monospace" }}>
                {idx === usageData.length - 1 ? "Hoje" : fmtChartDate(usageData[idx].date)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <div className="rounded-lg px-3 py-1.5 text-xs font-medium text-white" style={{ ...mono, border: "1px solid #1e1e1e", background: "linear-gradient(135deg, #ff6b2c, #ff8533)" }}>
            R$
          </div>
        </div>
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
              <HealthMark tone={agent.tone} />
              <p className="text-sm text-heading" style={mono}>{agent.name}</p>
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
      <SectionTitle eyebrow="Incidentes" title="Erros, logs e estados" description="Contadores por fonte, volume e estado recente." icon={ScrollText} />
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

export default function DashboardShell() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-app text-body">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="decorative-orb" style={{ width: 420, height: 420, top: -170, right: -160, opacity: 0.3 }} />
        <div className="decorative-orb" style={{ width: 300, height: 300, top: -120, left: -120, opacity: 0.15 }} />
        <div className="decorative-orb" style={{ width: 260, height: 260, bottom: 160, left: -100, opacity: 0.14 }} />
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="relative z-10 flex-1 overflow-y-auto p-5 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-10">
            <section id="dashboard" className="space-y-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-light tracking-tight text-heading" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}>
                  Visão Geral
                </h2>
                <p className="text-subtle">Veja o que está acontecendo com o OpenClaw hoje.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {topMetrics.map((metric, index) => <MetricTile key={metric.label} metric={metric} index={index} />)}
              </div>
            </section>

            <section className="space-y-5">
              <UsagePanel />
            </section>

            <section id="gateway" className="space-y-5">
              <SectionTitle eyebrow="Gateway" title="Saúde dos serviços" description="Estado do gateway, containers e portas relevantes do VPS." icon={HeartPulse} />
              <ServicesPanel />
            </section>

            <CronsAndTimers />
            <AgentsPanel />
            <LogsPanel />

          </div>
        </main>
      </div>
    </div>
  );
}
