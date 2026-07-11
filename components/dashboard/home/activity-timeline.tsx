"use client";

import { Card } from "@heroui/react";
import { Clock3 } from "lucide-react";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { HealthMark } from "../shared/health-mark";
import { mono } from "../shared/mono";

export function ActivityTimeline() {
  const { activityTimeline } = useSnapshot();
  return (
    <Card className="p-4" data-testid="activity-timeline">
      <Card.Header className="flex flex-row items-center justify-between p-0">
        <div>
          <Card.Title className="text-base text-heading" style={mono}>Últimas 24 horas</Card.Title>
          <Card.Description className="text-xs text-subtle">O que aconteceu nos fluxos principais.</Card.Description>
        </div>
        <Clock3 size={18} className="text-[#D4835A]" />
      </Card.Header>
      <Card.Content className="mt-4 space-y-0 p-0">
        {activityTimeline.map((item, index) => (
          <div
            key={item.id}
            className={`flex gap-3 py-3 ${index > 0 ? "border-t border-border-dim" : ""}`}
            data-testid={`timeline-item-${item.id}`}
          >
            <div className="w-12 shrink-0 pt-0.5 text-[11px] text-subtle" style={mono}>{item.time}</div>
            <HealthMark tone={item.tone} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.12em] text-subtle" style={mono}>{item.flow}</p>
              <p className="mt-1 text-sm text-body">{item.summary}</p>
            </div>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}
