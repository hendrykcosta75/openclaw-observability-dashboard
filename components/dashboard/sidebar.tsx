"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { mono } from "./shared/mono";
import { getSnapshotIcon } from "./shared/snapshot-icon";
import { sidebarNav } from "./shared/sidebar-nav-config";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { sidebarStats } = useSnapshot();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar navegação"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] shrink-0 flex-col border-r border-border-dim transition-transform duration-200 lg:static lg:h-screen lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "rgba(14, 14, 14, 0.85)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4), 1px 0 0 rgba(255,255,255,0.02)",
        }}
      >
        <div className="border-b border-border-dim p-5">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-[14px] border border-[rgba(255,107,44,0.16)] bg-[rgba(255,107,44,0.08)] glow-orange-strong">
              <Image src="/assets/openclaw-profile.jpg" alt="OpenClaw" fill sizes="40px" className="object-cover" priority />
            </div>
            <div>
              <p className="text-gradient text-[13px] font-bold uppercase tracking-[0.18em]" style={mono}>OpenClaw</p>
              <p className="text-[11px] text-subtle" style={mono}>Operations</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
          <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-subtle" style={mono}>Monitoramento</p>
          <ul className="space-y-1">
            {sidebarNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2 text-[12px] transition-all ${active ? "sidebar-item-active" : "rounded-[10px] text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[rgba(255,255,255,0.88)]"}`}
                    style={mono}
                  >
                    <Icon size={14} className="opacity-70" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border-dim p-3">
          <div className="grid grid-cols-3 gap-2">
            {sidebarStats.map((stat) => {
              const Icon = getSnapshotIcon(stat.icon);
              return (
                <div key={stat.label} className="rounded-[12px] bg-dim p-2 text-center">
                  <Icon size={14} className="mx-auto mb-1 text-[#D4835A]" />
                  <div className="text-[13px] font-semibold text-heading" style={mono}>{stat.value}</div>
                  <div className="text-[9px] text-subtle" style={mono}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
