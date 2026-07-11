import {
  Bot,
  CircleDollarSign,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  LucideIcon,
  ScrollText,
  Settings,
} from "lucide-react";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const sidebarNav: SidebarNavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Logs", href: "/logs", icon: ScrollText },
  { label: "Agentes", href: "/agentes", icon: Bot },
  { label: "Gateway", href: "/gateway", icon: HeartPulse },
  { label: "Crons", href: "/crons", icon: Clock3 },
  { label: "Custos", href: "/custos", icon: CircleDollarSign },
  { label: "Configuração", href: "/custos/precos", icon: Settings },
];
