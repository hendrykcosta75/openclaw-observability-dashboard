"use client";

import { Card } from "@heroui/react";
import { Bot } from "lucide-react";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { HealthMark } from "../shared/health-mark";
import { mono } from "../shared/mono";
import { SectionTitle } from "../shared/section-title";

export function AgentesPage() {
  const { agentDetails, agentRows, snapshotMeta } = useSnapshot();

  function sumField(field: "sessions" | "trajectories") {
    let found = false;
    const total = agentRows.reduce((acc, row) => {
      const value = Number.parseInt(row[field], 10);
      if (!Number.isFinite(value)) return acc;
      found = true;
      return acc + value;
    }, 0);
    return found ? total : null;
  }

  const totalSessions = sumField("sessions");
  const totalTrajectories = sumField("trajectories");

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-light tracking-tight text-heading" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}>
          Agentes
        </h1>
        <p className="text-subtle">Sessões, trajetórias, modelos e inventário seguro de plugins/MCPs.</p>
        <p className="text-xs text-subtle" style={mono}>Coletado em {snapshotMeta.collectedAt}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card p-4">
          <Card.Header className="p-0"><Card.Title className="text-sm text-subtle">Sessões totais</Card.Title></Card.Header>
          <Card.Content className="p-0 pt-2"><p className="text-2xl font-bold text-heading" style={mono}>{totalSessions ?? "—"}</p></Card.Content>
        </Card>
        <Card className="glass-card p-4">
          <Card.Header className="p-0"><Card.Title className="text-sm text-subtle">Trajetórias totais</Card.Title></Card.Header>
          <Card.Content className="p-0 pt-2"><p className="text-2xl font-bold text-heading" style={mono}>{totalTrajectories ?? "—"}</p></Card.Content>
        </Card>
      </div>

      <section className="space-y-5">
        <SectionTitle eyebrow="OpenClaw" title="Inventário de agentes" description="Metadados sanitizados — sem payloads, tokens ou conteúdo de mensagens." icon={Bot} />
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[1fr_1.4fr_.55fr_.55fr_.75fr] gap-3 border-b border-border-dim bg-dim px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-subtle" style={mono}>
            <span>Agente</span><span>Função</span><span>Sessões</span><span>Traj.</span><span>Último sinal</span>
          </div>
          {agentRows.map((agent, index) => (
            <div key={agent.name} className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1fr_1.4fr_.55fr_.55fr_.75fr] ${index > 0 ? "border-t border-border-dim" : ""}`}>
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

      <section className="space-y-5">
        <SectionTitle eyebrow="Detalhe" title="Modelos, plugins e MCPs" description="IDs de modelo e nomes de integração permitidos pelo coletor sanitizado." icon={Bot} />
        <div className="grid gap-4 lg:grid-cols-3">
          {agentDetails.map((detail) => (
            <Card key={detail.name} className="p-4">
              <Card.Header className="flex flex-row items-center justify-between p-0">
                <Card.Title className="text-base text-heading" style={mono}>{detail.name}</Card.Title>
                <HealthMark tone={detail.tone} />
              </Card.Header>
              <Card.Content className="mt-4 space-y-3 p-0 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-subtle" style={mono}>Modelo</p>
                  <p className="text-heading" style={mono}>{detail.modelId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-subtle" style={mono}>Eventos observados</p>
                  <p className="text-body" style={mono}>{detail.recentEvents}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-subtle" style={mono}>Plugins</p>
                  <p className="text-body" style={mono}>{detail.plugins.join(" · ")}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-subtle" style={mono}>MCPs</p>
                  <p className="text-body" style={mono}>{detail.mcps.join(" · ")}</p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
