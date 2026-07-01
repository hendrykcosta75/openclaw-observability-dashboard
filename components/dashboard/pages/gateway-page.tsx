import { Card } from "@heroui/react";
import { HeartPulse, Server } from "lucide-react";
import { gatewayDetails, portSummaries, serviceRows, snapshotMeta } from "@/lib/openclaw-snapshot";
import { HealthMark } from "../shared/health-mark";
import { mono } from "../shared/mono";
import { SectionTitle } from "../shared/section-title";

export function GatewayPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-light tracking-tight text-heading" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}>
          Gateway
        </h1>
        <p className="text-subtle">Saúde do gateway, recursos systemd, containers e mapa de portas.</p>
        <p className="text-xs text-subtle" style={mono}>Coletado em {snapshotMeta.collectedAt} · host {snapshotMeta.host}</p>
      </div>

      <section className="space-y-5">
        <SectionTitle eyebrow="Recursos" title="openclaw-gateway.service" description="Métricas de processo e limites do unit systemd." icon={HeartPulse} />
        <Card className="glass-card p-4">
          <Card.Content className="grid gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "PID", value: gatewayDetails.pid },
              { label: "Memória atual", value: gatewayDetails.memoryCurrent },
              { label: "Tasks", value: `${gatewayDetails.tasksCurrent} / ${gatewayDetails.tasksMax}` },
              { label: "Restarts", value: gatewayDetails.nRestarts },
              { label: "Memória high", value: gatewayDetails.memoryHigh },
              { label: "Memória max", value: gatewayDetails.memoryMax },
              { label: "Health latency", value: `${gatewayDetails.healthLatencyMs} ms` },
              { label: "Health endpoint", value: gatewayDetails.healthEndpoint },
            ].map((item) => (
              <div key={item.label} className="rounded-[14px] border border-border-dim bg-dim/50 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>{item.label}</p>
                <p className="mt-1 text-sm text-heading" style={mono}>{item.value}</p>
              </div>
            ))}
          </Card.Content>
        </Card>
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Serviços" title="Serviços e portas" description="Gateway privado, Evolution, browser/CDP e proxy do dashboard." icon={Server} />
        <Card className="p-4">
          <Card.Content className="space-y-3 p-0">
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
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Rede" title="Mapa de portas" description="Bind, processo e exposição pública vs loopback." icon={Server} />
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[.55fr_.85fr_1fr_.65fr] gap-3 border-b border-border-dim bg-dim px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-subtle" style={mono}>
            <span>Porta</span><span>Bind</span><span>Processo</span><span>Exposição</span>
          </div>
          {portSummaries.map((port, index) => (
            <div key={`${port.port}-${port.process}`} className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[.55fr_.85fr_1fr_.65fr] ${index > 0 ? "border-t border-border-dim" : ""}`}>
              <p className="text-sm text-heading" style={mono}>:{port.port}</p>
              <p className="text-sm text-body" style={mono}>{port.bind}</p>
              <p className="text-sm text-body" style={mono}>{port.process}</p>
              <p className="text-sm text-subtle" style={mono}>{port.exposure}</p>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
