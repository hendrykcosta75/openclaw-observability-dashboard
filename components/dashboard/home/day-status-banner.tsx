"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { dayStatus, snapshotMeta } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";

const toneStyles = {
  ok: {
    border: "border-emerald-500/20 bg-emerald-500/10",
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
  },
  warn: {
    border: "border-[#D4835A]/25 bg-[rgba(255,107,44,0.08)]",
    icon: AlertTriangle,
    iconClass: "text-[#D4835A]",
  },
  danger: {
    border: "border-red-500/20 bg-red-500/10",
    icon: AlertTriangle,
    iconClass: "text-red-400",
  },
  planned: {
    border: "border-[#D4835A]/25 bg-[rgba(255,107,44,0.08)]",
    icon: AlertTriangle,
    iconClass: "text-[#D4835A]",
  },
} as const;

export function DayStatusBanner() {
  const style = toneStyles[dayStatus.tone];
  const Icon = style.icon;

  return (
    <div
      className={`flex flex-col gap-3 rounded-[14px] border p-4 sm:flex-row sm:items-center sm:justify-between ${style.border}`}
      data-testid="day-status-banner"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/20 ${style.iconClass}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-base font-medium text-heading" style={mono}>{dayStatus.headline}</p>
          <p className="mt-1 text-sm text-body">{dayStatus.summary}</p>
        </div>
      </div>
      <p className="text-[11px] text-subtle sm:text-right" style={mono}>
        Atualizado {snapshotMeta.collectedAtLabel}
      </p>
    </div>
  );
}
