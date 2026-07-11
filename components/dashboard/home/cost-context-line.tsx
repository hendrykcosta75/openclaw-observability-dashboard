"use client";

import { useSnapshot } from "@/components/dashboard/snapshot-context";

export function CostContextLine() {
  const { costContextInsight } = useSnapshot();
  return (
    <div className="space-y-1" data-testid="cost-context-line">
      <p className="text-sm text-body">{costContextInsight.line}</p>
      <p className="text-xs text-subtle">{costContextInsight.weeklyLine}</p>
    </div>
  );
}
