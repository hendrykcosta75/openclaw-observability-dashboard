"use client";

import React from "react";
import { Card } from "@heroui/react";
import { Bot, Clock3, HeartPulse, ScrollText, Server } from "lucide-react";
import {
  agentRows,
  cronRows,
  logRows,
  serviceRows,
  timerRows,
  topMetrics,
} from "@/lib/openclaw-snapshot";
import { Header } from "./dashboard/header";
import { Sidebar } from "./dashboard/sidebar";
import { HealthMark } from "./dashboard/shared/health-mark";
import { mono } from "./dashboard/shared/mono";
import { SectionTitle } from "./dashboard/shared/section-title";
import { UsageChart } from "./dashboard/shared/usage-chart";

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
              <UsageChart id="custos" />
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
