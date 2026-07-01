"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";
import type { HealthTone } from "@/lib/openclaw-snapshot";

const toneIconStyles: Record<HealthTone, { text: string; label: string; icon: React.ElementType }> = {
  ok: { text: "text-emerald-400", label: "operational", icon: CheckCircle2 },
  warn: { text: "text-[#D4835A]", label: "watch", icon: AlertTriangle },
  danger: { text: "text-red-400", label: "incident", icon: AlertTriangle },
  planned: { text: "text-[#D4835A]", label: "planned", icon: CircleDot },
};

export function HealthMark({ tone, label }: { tone: HealthTone; label?: string }) {
  const s = toneIconStyles[tone];
  const Icon = s.icon;
  return (
    <span aria-label={label ?? s.label} title={label ?? s.label} className={`inline-flex h-7 w-7 items-center justify-center ${s.text}`}>
      <Icon size={16} strokeWidth={1.9} />
    </span>
  );
}
