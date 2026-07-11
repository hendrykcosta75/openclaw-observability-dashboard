"use client";

import Link from "next/link";
import { Card } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { HealthMark } from "../shared/health-mark";
import { mono } from "../shared/mono";

export function FlowSummaryCards() {
  const { flowSummaryCards } = useSnapshot();
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="flow-summary-cards">
      {flowSummaryCards.map((flow) => (
        <Link key={flow.id} href={flow.href} data-testid={`flow-card-${flow.id}`}>
          <Card className="h-full p-4 transition-colors hover:border-[rgba(255,107,44,0.2)]">
            <Card.Header className="flex flex-row items-start justify-between gap-2 p-0">
              <Card.Title className="text-sm text-subtle">{flow.label}</Card.Title>
              <HealthMark tone={flow.tone} />
            </Card.Header>
            <Card.Content className="mt-3 space-y-2 p-0">
              <p className="text-sm font-medium text-heading" style={mono}>{flow.headline}</p>
              <p className="text-xs text-subtle">{flow.detail}</p>
              <div className="flex items-center gap-1 pt-1 text-[11px] text-[#D4835A]" style={mono}>
                Ver detalhes
                <ChevronRight size={12} />
              </div>
            </Card.Content>
          </Card>
        </Link>
      ))}
    </div>
  );
}
