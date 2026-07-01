"use client";

import React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function DetailDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-app text-body">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="decorative-orb" style={{ width: 420, height: 420, top: -170, right: -160, opacity: 0.3 }} />
        <div className="decorative-orb" style={{ width: 300, height: 300, top: -120, left: -120, opacity: 0.15 }} />
        <div className="decorative-orb" style={{ width: 260, height: 260, bottom: 160, left: -100, opacity: 0.14 }} />
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="relative z-10 flex-1 overflow-y-auto p-5 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
