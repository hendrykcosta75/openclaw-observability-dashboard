"use client";

import Image from "next/image";
import { Button, Dropdown } from "@heroui/react";
import { Bell, LogOut, Menu } from "lucide-react";
import { mono } from "./shared/mono";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:px-6"
      style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-3">
        <Button isIconOnly size="sm" variant="ghost" aria-label="Abrir navegação" className="h-10 w-10 min-w-10 rounded-full border-none text-subtle transition-colors hover:bg-[rgba(255,107,44,0.06)] hover:text-heading lg:hidden" onPress={onMenuClick}>
          <Menu size={19} />
        </Button>
        <span className="text-gradient text-[13px] font-bold uppercase tracking-[2px]" style={mono}>Painel</span>
      </div>
      <div className="flex items-center gap-2">
        <Button isIconOnly size="sm" variant="ghost" aria-label="Notificações" className="h-9 w-9 min-w-9 rounded-full border-none text-subtle transition-colors hover:bg-[rgba(255,107,44,0.06)] hover:text-heading">
          <Bell size={17} />
        </Button>
        <Dropdown>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Perfil" className="h-9 w-9 min-w-9 rounded-full border-none text-subtle transition-colors hover:bg-[rgba(255,107,44,0.06)] hover:text-heading">
            <span className="relative h-7 w-7 overflow-hidden rounded-full border border-[rgba(255,107,44,0.16)]">
              <Image src="/assets/openclaw-profile.jpg" alt="Perfil OpenClaw" fill sizes="28px" className="object-cover" />
            </span>
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu aria-label="Profile actions" onAction={(key) => {
              if (key === "logout") void handleLogout();
            }}>
              <Dropdown.Item id="profile" textValue="OpenClaw dashboard profile" className="h-14 gap-2">
                <p className="font-semibold">OpenClaw</p>
                <p className="font-semibold text-subtle">Dashboard</p>
              </Dropdown.Item>
              <Dropdown.Item id="logout" textValue="Sair" variant="danger">
                <div className="flex items-center gap-2">
                  <LogOut size={14} />
                  Sair
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
