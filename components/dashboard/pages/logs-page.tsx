import { Card } from "@heroui/react";
import { ScrollText } from "lucide-react";
import { logRows, logWindowBuckets, snapshotMeta, stateCards } from "@/lib/openclaw-snapshot";
import { HealthMark } from "../shared/health-mark";
import { mono } from "../shared/mono";
import { SectionTitle } from "../shared/section-title";

export function LogsPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-light tracking-tight text-heading" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}>
          Logs e estados
        </h1>
        <p className="text-subtle">Contadores agregados por fonte, janela temporal e buckets de estado.</p>
        <p className="text-xs text-subtle" style={mono}>Coletado em {snapshotMeta.collectedAt}</p>
      </div>

      <section className="space-y-5">
        <SectionTitle eyebrow="Janelas" title="Erros por período" description="Agregados sanitizados — sem linhas brutas de journal ou arquivo." icon={ScrollText} />
        <div className="grid gap-4 md:grid-cols-2">
          {logWindowBuckets.map((bucket) => (
            <Card key={bucket.window} className="glass-card p-4">
              <Card.Header className="p-0">
                <Card.Title className="text-base text-heading" style={mono}>Janela {bucket.window}</Card.Title>
              </Card.Header>
              <Card.Content className="mt-3 grid grid-cols-3 gap-3 p-0">
                <div>
                  <p className="text-xs text-subtle" style={mono}>Erros</p>
                  <p className="text-lg text-heading" style={mono}>{bucket.errors}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle" style={mono}>Warnings</p>
                  <p className="text-lg text-heading" style={mono}>{bucket.warnings}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle" style={mono}>Deferred</p>
                  <p className="text-lg text-heading" style={mono}>{bucket.deferred}</p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Estado" title="Buckets de fluxo" description="Contagens de state files resumidas por domínio operacional." icon={ScrollText} />
        <div className="grid gap-4 md:grid-cols-2">
          {stateCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="glass-card p-4">
                <Card.Header className="flex flex-row items-start justify-between p-0">
                  <div>
                    <Card.Title className="text-base text-heading" style={mono}>{card.label}</Card.Title>
                    <Card.Description className="mt-1 text-xs text-subtle">{card.detail}</Card.Description>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-[#D4835A]" />
                    <HealthMark tone={card.tone} />
                  </div>
                </Card.Header>
                <Card.Content className="mt-3 p-0">
                  <p className="text-xl font-semibold text-heading" style={mono}>{card.value}</p>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Fontes" title="Arquivos e journal" description="Amostragem, volume e contadores por fonte observada." icon={ScrollText} />
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[1.4fr_.7fr_.45fr_.45fr_.45fr_.55fr] gap-3 border-b border-border-dim bg-dim px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-subtle" style={mono}>
            <span>Fonte</span><span>Amostra</span><span>Erros</span><span>Deferred</span><span>Sucesso</span><span>Taxa</span>
          </div>
          {logRows.map((row, index) => {
            const successRate = row.success > 0 ? `${Math.round((row.success / 3000) * 100)}% amostra` : "—";
            return (
              <div key={row.file} className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.4fr_.7fr_.45fr_.45fr_.45fr_.55fr] ${index > 0 ? "border-t border-border-dim" : ""}`}>
                <div>
                  <p className="text-sm text-heading" style={mono}>{row.file}</p>
                  <p className="mt-1 text-xs text-subtle">{row.size}</p>
                </div>
                <p className="text-sm text-body" style={mono}>{row.sampled}</p>
                <p className="text-sm text-emerald-300" style={mono}>{row.errors}</p>
                <p className="text-sm text-emerald-300" style={mono}>{row.deferred}</p>
                <p className="text-sm text-[#D4835A]" style={mono}>{row.success}</p>
                <p className="text-xs text-subtle" style={mono}>{successRate}</p>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
}
