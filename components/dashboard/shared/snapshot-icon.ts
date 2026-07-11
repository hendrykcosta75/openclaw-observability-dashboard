import {
  Activity,
  AlertTriangle,
  Bot,
  CircleDollarSign,
  Clock3,
  FileWarning,
  HeartPulse,
  ListChecks,
  ShieldCheck,
  SquareTerminal,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import type { SnapshotIconName } from "@/lib/openclaw-snapshot-types";

const snapshotIcons: Record<SnapshotIconName, LucideIcon> = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  bot: Bot,
  "circle-dollar-sign": CircleDollarSign,
  "clock-3": Clock3,
  "file-warning": FileWarning,
  "heart-pulse": HeartPulse,
  "list-checks": ListChecks,
  "shield-check": ShieldCheck,
  "terminal-square": SquareTerminal,
  "timer-reset": TimerReset,
};

export function getSnapshotIcon(name: SnapshotIconName): LucideIcon {
  return snapshotIcons[name];
}
