"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@heroui/react";
import { ArrowRight, HeartPulse, ScrollText, Server } from "lucide-react";
import { errorHighlights, serviceHealthSummary } from "@/lib/openclaw-snapshot";
import { Header } from "./dashboard/header";
import { Sidebar } from "./dashboard/sidebar";
import { AgentCostBarChart } from "./dashboard/costs/agent-cost-bar-chart";
import { CostKpiCards } from "./dashboard/costs/cost-kpi-cards";
import { NotificationBanner } from "./dashboard/notifications/notification-banner";
import { HealthMark } from "./dashboard/shared/health-mark";
import { mono } from "./dashboard/shared/mono";
import { SectionTitle } from "./dashboard/shared/section-title";

function ServicesHealthPanel() {
  return (
    <Card className="p-4">
      <Card.Header className="flex flex-row items-center justify-between p-0">
        <div>
          <Card.Title className="text-base text-heading" style={mono}>O que está no ar</Card.Title>
          <Card.Description className="text-xs text-subtle">Status dos serviços principais.</Card.Description>
        </div>
        <Server size={18} className="text-[#D4835A]" />
      </Card.Header>
      <Card.Content className="mt-4 space-y-3 p-0">
        {serviceHealthSummary.map((row) => (
          <div key={row.name} className="flex flex-col gap-2 rounded-[14px] border border-border-dim bg-dim/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-heading" style={mono}>{row.name}</p>
              <p className="mt-1 text-xs text-subtle">{row.detail}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-subtle" style={mono}>
              <span>{row.status}</span>
              <HealthMark tone={row.tone} />
            </div>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

function ErrorsSummaryPanel() {
  return (
    <section id="logs" className="space-y-5">
      <SectionTitle eyebrow="Incidentes" title="Problemas recentes" description="Resumo das fontes monitoradas nas últimas 24h." icon={ScrollText} />
      <Card className="overflow-hidden p-0">
        {errorHighlights.map((row, index) => (
          <div key={row.source} className={`flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${index > 0 ? "border-t border-border-dim" : ""}`}>
            <div className="flex items-center gap-2">
              <HealthMark tone={row.tone} />
              <p className="text-sm text-heading" style={mono}>{row.source}</p>
            </div>
            <p className="text-sm text-body">{row.summary}</p>
          </div>
        ))}
        <div className="border-t border-border-dim px-4 py-3">
          <Link href="/logs" className="inline-flex items-center gap-1.5 text-sm text-[#D4835A] transition-colors hover:text-[#ff8533]" style={mono}>
            Ver logs completos
            <ArrowRight size={14} />
          </Link>
        </div>
      </Card>
    </section>
  );
}

const detailLinks = [
  { href: "/agentes", label: "Agentes" },
  { href: "/crons", label: "Crons" },
  { href: "/logs", label: "Logs" },
  { href: "/gateway", label: "Gateway" },
  { href: "/custos", label: "Custos" },
];

function DetailLinksRow() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2" data-testid="detail-links-row">
      {detailLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-xs text-subtle transition-colors hover:text-heading"
          style={mono}
        >
          {link.label} →
        </Link>
      ))}
    </div>
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
                <p className="text-subtle">Resumo do que precisa de atenção hoje.</p>
              </div>

              <NotificationBanner />
              <CostKpiCards />
            </section>

            <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <AgentCostBarChart />
              <section id="gateway" className="space-y-5">
                <SectionTitle eyebrow="Gateway" title="Saúde dos serviços" description="Estado resumido dos componentes principais." icon={HeartPulse} />
                <ServicesHealthPanel />
              </section>
            </section>

            <ErrorsSummaryPanel />
            <DetailLinksRow />
          </div>
        </main>
      </div>
    </div>
  );
}
