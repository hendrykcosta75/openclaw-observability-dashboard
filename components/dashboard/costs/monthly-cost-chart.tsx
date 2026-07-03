"use client";

import { Card } from "@heroui/react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthlyCostYearData } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";
import { fmtTokens } from "./cost-calculation-panel";

function fmtBrl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MonthlyCostChart() {
  return (
    <Card className="p-6">
      <Card.Header className="mb-4 p-0">
        <div>
          <Card.Title className="text-base font-semibold text-heading">Evolução de custos por mês</Card.Title>
          <Card.Description className="text-sm text-subtle" style={mono}>2026 · valores estimados</Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="p-0">
        <div className="h-[220px] w-full" data-testid="monthly-cost-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyCostYearData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `R$${v}`}
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,107,44,0.06)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const row = payload[0].payload as (typeof monthlyCostYearData)[number];
                  return (
                    <div className="rounded-lg border border-border-dim bg-[#1a1a1a] px-2.5 py-1.5 text-[11px] shadow-lg" style={mono}>
                      <div>
                        <span className="text-[#D4835A] font-semibold">{fmtBrl(row.cost)}</span>
                        <span className="ml-2 text-subtle">{row.label}{row.partial ? " · parcial" : ""}</span>
                      </div>
                      <div className="mt-1 text-subtle">
                        in {fmtTokens(row.tokens.input)} · out {fmtTokens(row.tokens.output)}
                      </div>
                      <div className="mt-1 text-subtle">{row.calculationBases[0]?.inputRatePer1M}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                {monthlyCostYearData.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill={entry.partial ? "rgba(212,131,90,0.45)" : "#D4835A"}
                    data-testid={`monthly-cost-bar-${entry.month}`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  );
}
