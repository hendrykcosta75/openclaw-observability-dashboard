"use client";

import React from "react";
import { Card } from "@heroui/react";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { costKpiCards } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";
import { CostKpiDetailModal } from "./cost-kpi-detail-modal";

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp size={14} className="text-[#D4835A]" />;
  if (trend === "down") return <TrendingDown size={14} className="text-emerald-400" />;
  return null;
}

export function CostKpiCards() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = costKpiCards.find((item) => item.id === selectedId) ?? null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="cost-kpi-grid">
        {costKpiCards.map((kpi, index) => (
          <button
            key={kpi.id}
            type="button"
            data-testid={`cost-kpi-${kpi.id}`}
            onClick={() => setSelectedId(kpi.id)}
            className="text-left"
          >
            <Card className={`glass-card relative w-full overflow-hidden p-4 transition-colors hover:border-[rgba(255,107,44,0.2)] ${index === 0 ? "glow-orange" : ""}`}>
              <Card.Header className="flex flex-row items-center justify-between p-0 pb-1">
                <p className="text-sm font-medium text-subtle">{kpi.label}</p>
                <ChevronRight size={14} className="text-subtle" />
              </Card.Header>
              <Card.Content className="p-0">
                <div className="text-xl font-bold text-heading" style={mono}>{kpi.value}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <TrendIcon trend={kpi.trend} />
                  <p className="text-xs text-subtle">{kpi.comparison}</p>
                </div>
              </Card.Content>
            </Card>
          </button>
        ))}
      </div>

      <CostKpiDetailModal
        kpi={selected}
        isOpen={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </>
  );
}
