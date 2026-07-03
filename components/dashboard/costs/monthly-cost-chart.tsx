"use client";

import React from "react";
import { Card } from "@heroui/react";
import { monthlyCostYearData } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";
import { fmtTokens } from "./cost-calculation-panel";

function fmtBrl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MonthlyCostChart() {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const chartData = monthlyCostYearData;
  const values = chartData.map((d) => d.cost);
  const max = Math.max(...values, 1);
  const w = 510;
  const h = 170;
  const padX = 5;
  const padY = 10;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const areaGradId = "openclawMonthlyAreaGrad";
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

  return (
    <Card className="p-6">
      <Card.Header className="mb-4 p-0">
        <div>
          <Card.Title className="text-base font-semibold text-heading">Evolução de custos por mês</Card.Title>
          <Card.Description className="text-sm text-subtle" style={mono}>2026 · valores estimados</Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="p-0">
        <div className="relative" style={{ height: 180 }} data-testid="monthly-cost-chart">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "100%", display: "block" }} preserveAspectRatio="none">
            <defs>
              <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8712A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#E8712A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1={h * 0.25} x2={w} y2={h * 0.25} stroke="rgba(255,255,255,0.03)" />
            <line x1="0" y1={h * 0.5} x2={w} y2={h * 0.5} stroke="rgba(255,255,255,0.03)" />
            <line x1="0" y1={h * 0.75} x2={w} y2={h * 0.75} stroke="rgba(255,255,255,0.03)" />
            {areaPath && <path d={areaPath} fill={`url(#${areaGradId})`} />}
            {linePath && <path d={linePath} fill="none" stroke="#D4835A" strokeWidth="2" />}
            {points.map((p, i) => (
              <rect
                key={chartData[i].month}
                data-testid={`monthly-cost-point-${chartData[i].month}`}
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

          {points.map((p, i) => {
            const isLast = i === chartData.length - 1;
            return (
              <div
                key={chartData[i].month}
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
                  opacity: chartData[i].partial ? 0.65 : 1,
                }}
              />
            );
          })}

          {hoverIdx !== null && points[hoverIdx] && (
            <div
              className="absolute pointer-events-none z-10 rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg"
              style={{
                left: `${(points[hoverIdx].x / w) * 100}%`,
                top: `${(points[hoverIdx].y / h) * 100}%`,
                transform: "translate(-50%, -130%)",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                color: "#f0f0f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "#D4835A", fontWeight: 600 }}>{fmtBrl(values[hoverIdx])}</span>
              <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>
                {chartData[hoverIdx].label}{chartData[hoverIdx].partial ? " · parcial" : ""}
              </span>
              <div style={{ color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                in {fmtTokens(chartData[hoverIdx].tokens.input)} · out {fmtTokens(chartData[hoverIdx].tokens.output)}
              </div>
            </div>
          )}

          <div className="mt-1 flex justify-between px-0">
            {chartData.map((row) => (
              <span key={row.month} className="text-[9px]" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono', monospace" }}>
                {row.label}
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
