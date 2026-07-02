"use client";

import React from "react";
import { Button, Dropdown } from "@heroui/react";
import { AlertTriangle, Bell } from "lucide-react";
import { dashboardNotifications } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";
import { NotificationDetailModal } from "./notification-detail-modal";

export function NotificationsMenu() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = dashboardNotifications.find((item) => item.id === selectedId) ?? null;
  const count = dashboardNotifications.length;

  return (
    <>
      <Dropdown>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Notificações"
          className="relative h-9 w-9 min-w-9 rounded-full border-none text-subtle transition-colors hover:bg-[rgba(255,107,44,0.06)] hover:text-heading"
        >
          <Bell size={17} />
          {count > 0 && (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-400 ring-2 ring-[rgba(10,10,10,0.9)]"
            />
          )}
        </Button>
        <Dropdown.Popover className="w-80 border border-border-dim bg-surface">
          <Dropdown.Menu
            aria-label="Notificações"
            onAction={(key) => setSelectedId(String(key))}
          >
            {dashboardNotifications.map((notification) => (
              <Dropdown.Item key={notification.id} id={notification.id} textValue={notification.title} className="h-auto py-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
                  <div className="min-w-0">
                    <p className="text-sm text-heading" style={mono}>{notification.title}</p>
                    <p className="mt-0.5 text-xs text-subtle">{notification.summary}</p>
                  </div>
                </div>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

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
