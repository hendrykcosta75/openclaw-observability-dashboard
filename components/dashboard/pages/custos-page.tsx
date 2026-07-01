import { Card } from "@heroui/react";
import { CircleDollarSign } from "lucide-react";
import { costDetails, snapshotMeta } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";
import { SectionTitle } from "../shared/section-title";
import { UsageChart } from "../shared/usage-chart";

export function CustosPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-light tracking-tight text-heading" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}>
          Custos
        </h1>
        <p className="text-subtle">Instrumentação de tokens e inventário de providers.</p>
        <p className="text-xs text-subtle" style={mono}>Coletado em {snapshotMeta.collectedAt}</p>
      </div>

      <UsageChart gradientId="openclawUsageAreaGradDetail" />

      <section className="space-y-5">
        <SectionTitle eyebrow="Instrumentação" title="Estado da coleta" description="Fase 1 — sem valores confirmados por provider até o coletor real." icon={CircleDollarSign} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-card p-4">
            <Card.Header className="p-0">
              <Card.Title className="text-base text-heading" style={mono}>Tokens</Card.Title>
            </Card.Header>
            <Card.Content className="mt-3 space-y-2 p-0">
              <p className="text-sm text-body">{costDetails.tokenCollection}</p>
              <p className="text-xs text-subtle" style={mono}>{costDetails.traceSource}</p>
            </Card.Content>
          </Card>
          <Card className="glass-card p-4">
            <Card.Header className="p-0">
              <Card.Title className="text-base text-heading" style={mono}>Price map</Card.Title>
            </Card.Header>
            <Card.Content className="mt-3 p-0">
              <p className="text-sm text-body">{costDetails.priceMapStatus}</p>
            </Card.Content>
          </Card>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle eyebrow="Providers" title="Inventário de modelos" description="IDs de provider/model permitidos no dashboard sanitizado." icon={CircleDollarSign} />
        <div className="grid gap-4 md:grid-cols-2">
          {costDetails.providers.map((provider) => (
            <Card key={provider.id} className="p-4">
              <Card.Header className="p-0">
                <Card.Title className="text-base text-heading" style={mono}>{provider.id}</Card.Title>
              </Card.Header>
              <Card.Content className="mt-3 p-0">
                <p className="text-sm text-body" style={mono}>{provider.models.join(" · ")}</p>
              </Card.Content>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
