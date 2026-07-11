"use client";

import React from "react";
import { Card } from "@heroui/react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { mono } from "../shared/mono";
import { AgentCostDetailModal } from "./agent-cost-detail-modal";
import { fmtTokens } from "./cost-calculation-panel";

function fmtUsd(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "USD" });
}

const BAR_COLORS = ["#D4835A", "#ff8533", "#E8712A"];

export function AgentCostBarChart() {
  const { agentCostRows } = useSnapshot();
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null);
  const selected = agentCostRows.find((item) => item.agentId === selectedAgentId) ?? null;

  const chartData = agentCostRows.map((row) => ({
    agentId: row.agentId,
    label: row.label,
    cost: row.cost7d,
    tokens: row.tokens7d,
    rateLabel: row.calculationBases[0]?.inputRatePer1M ?? "",
  }));

  return (
    <>
      <Card id="custos" className="p-6">
        <Card.Header className="mb-4 p-0">
          <div>
            <Card.Title className="text-base font-semibold text-heading">Custo por agente</Card.Title>
            <Card.Description className="text-sm text-subtle" style={mono}>Últimos 7 dias · valores estimados</Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <div className="h-[220px] w-full" data-testid="agent-cost-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `US$${v}`}
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,107,44,0.06)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as (typeof chartData)[number];
                    return (
                      <div className="rounded-lg border border-border-dim bg-[#1a1a1a] px-2.5 py-1.5 text-[11px] shadow-lg" style={mono}>
                        <div>
                          <span className="text-[#D4835A] font-semibold">{fmtUsd(row.cost)}</span>
                          <span className="ml-2 text-subtle">{row.label}</span>
                        </div>
                        <div className="mt-1 text-subtle">
                          in {fmtTokens(row.tokens.input)} · out {fmtTokens(row.tokens.output)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.agentId}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                      data-testid={`agent-cost-bar-${entry.agentId}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedAgentId(entry.agentId)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-subtle">Clique em uma barra para ver detalhes do agente.</p>
        </Card.Content>
      </Card>

      <AgentCostDetailModal
        agent={selected}
        isOpen={selectedAgentId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAgentId(null);
        }}
      />
    </>
  );
}
