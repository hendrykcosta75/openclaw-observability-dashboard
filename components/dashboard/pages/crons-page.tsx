"use client";

import { Card } from "@heroui/react";
import { Clock3 } from "lucide-react";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { mono } from "../shared/mono";
import { SectionTitle } from "../shared/section-title";

export function CronsPage() {
  const { cronCategoryGroups, cronRows, snapshotMeta, timerRows, sidebarStats } = useSnapshot();
  const cronCount = sidebarStats.find((stat) => stat.label === "Crons")?.value ?? "—";
  const timerCount = sidebarStats.find((stat) => stat.label === "Timers")?.value ?? "—";

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-light tracking-tight text-heading" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}>
          Crons e timers
        </h1>
        <p className="text-subtle">Cadências de crontab, timers systemd e agrupamento por domínio operacional.</p>
        <p className="text-xs text-subtle" style={mono}>Coletado em {snapshotMeta.collectedAt}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card p-4">
          <Card.Header className="p-0"><Card.Title className="text-sm text-subtle">Crons de usuário</Card.Title></Card.Header>
          <Card.Content className="p-0 pt-2"><p className="text-2xl font-bold text-heading" style={mono}>{cronCount}</p></Card.Content>
        </Card>
        <Card className="glass-card p-4">
          <Card.Header className="p-0"><Card.Title className="text-sm text-subtle">Timers systemd</Card.Title></Card.Header>
          <Card.Content className="p-0 pt-2"><p className="text-2xl font-bold text-heading" style={mono}>{timerCount}</p></Card.Content>
        </Card>
      </div>

      <section className="space-y-5">
        <SectionTitle eyebrow="Automação" title="Crons de usuário" description="Jobs ativos resumidos sem argumentos sensíveis." icon={Clock3} />
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[1fr_.75fr_1fr_.65fr] gap-3 border-b border-border-dim bg-dim px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-subtle" style={mono}>
            <span>Job</span><span>Cadência</span><span>Target</span><span>Estado</span>
          </div>
          {cronRows.map((row, index) => (
            <div key={row.name} className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1fr_.75fr_1fr_.65fr] ${index > 0 ? "border-t border-border-dim" : ""}`}>
              <p className="text-sm text-heading" style={mono}>{row.name}</p>
              <p className="text-sm text-[#D4835A]" style={mono}>{row.cadence}</p>
              <p className="text-sm text-body">{row.target}</p>
              <p className="text-xs text-subtle" style={mono}>{row.health}</p>
            </div>
          ))}
        </Card>
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Systemd" title="Timers" description="Watchdogs e reapers que mantêm o gateway saudável." icon={Clock3} />
        <div className="grid gap-4 lg:grid-cols-2">
          {timerRows.map((timer) => (
            <Card key={timer.name} className="p-4">
              <Card.Header className="flex flex-row items-start justify-between p-0">
                <div>
                  <Card.Title className="text-base text-heading" style={mono}>{timer.name}</Card.Title>
                  <Card.Description className="mt-1 text-xs text-subtle">{timer.detail}</Card.Description>
                </div>
                <span className="shrink-0 text-xs text-[#D4835A]" style={mono}>{timer.status}</span>
              </Card.Header>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Agrupamento" title="Por categoria" description="Crons e timers relacionados por fluxo operacional." icon={Clock3} />
        <div className="grid gap-4 lg:grid-cols-3">
          {cronCategoryGroups.map((group) => (
            <Card key={group.category} className="p-4">
              <Card.Header className="p-0">
                <Card.Title className="text-base text-heading" style={mono}>{group.category}</Card.Title>
                <Card.Description className="mt-1 text-xs text-subtle">{group.description}</Card.Description>
              </Card.Header>
              <Card.Content className="mt-4 space-y-3 p-0 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>Crons</p>
                  <p className="text-body" style={mono}>{group.jobs.length ? group.jobs.join(" · ") : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>Timers</p>
                  <p className="text-body" style={mono}>{group.timers.join(" · ")}</p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
