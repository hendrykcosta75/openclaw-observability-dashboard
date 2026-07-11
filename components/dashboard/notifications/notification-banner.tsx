"use client";

import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { mono } from "../shared/mono";
import { NotificationDetailModal } from "./notification-detail-modal";

export function NotificationBanner() {
  const { dashboardNotifications } = useSnapshot();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = dashboardNotifications.find((item) => item.id === selectedId) ?? null;

  if (dashboardNotifications.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-2" data-testid="dashboard-notifications">
        {dashboardNotifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            data-testid={`notification-${notification.id}`}
            onClick={() => setSelectedId(notification.id)}
            className="flex w-full items-start gap-3 rounded-[14px] border border-red-500/20 bg-red-500/10 p-3 text-left transition-colors hover:border-red-500/30 hover:bg-red-500/14"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(239,68,68,0.12)]">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-heading" style={mono}>{notification.title}</p>
              <p className="mt-1 text-xs text-subtle">{notification.summary}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>
                {notification.detectedAt} · clique para detalhes
              </p>
            </div>
            <ChevronRight size={16} className="mt-1 shrink-0 text-subtle" />
          </button>
        ))}
      </div>

      <NotificationDetailModal
        notification={selected}
        isOpen={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </>
  );
}
