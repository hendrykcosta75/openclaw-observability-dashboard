"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@heroui/react";
import { ChevronRight, ListChecks } from "lucide-react";
import { attentionItems, dashboardNotifications } from "@/lib/openclaw-snapshot";
import { NotificationDetailModal } from "../notifications/notification-detail-modal";
import { HealthMark } from "../shared/health-mark";
import { mono } from "../shared/mono";

export function AttentionPanel() {
  const [notificationId, setNotificationId] = React.useState<string | null>(null);
  const selectedNotification = dashboardNotifications.find((item) => item.id === notificationId) ?? null;

  if (attentionItems.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="p-4" data-testid="attention-panel">
        <Card.Header className="flex flex-row items-center justify-between p-0">
          <div>
            <Card.Title className="text-base text-heading" style={mono}>Precisa da sua atenção</Card.Title>
            <Card.Description className="text-xs text-subtle">
              {attentionItems.length} {attentionItems.length === 1 ? "item" : "itens"} aguardando ação
            </Card.Description>
          </div>
          <ListChecks size={18} className="text-[#D4835A]" />
        </Card.Header>
        <Card.Content className="mt-4 space-y-2 p-0">
          {attentionItems.map((item) => {
            const inner = (
              <>
                <div className="flex items-center gap-2">
                  <HealthMark tone={item.tone} />
                  <p className="text-sm text-heading" style={mono}>
                    {item.count > 0 ? `${item.count} · ` : ""}{item.label}
                  </p>
                </div>
                <p className="mt-1 text-xs text-subtle">{item.description}</p>
              </>
            );

            const className = "flex w-full items-center justify-between rounded-[12px] border border-border-dim bg-dim/40 p-3 text-left transition-colors hover:border-[rgba(255,107,44,0.18)] hover:bg-dim/70";

            if (item.notificationId) {
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`attention-item-${item.id}`}
                  className={className}
                  onClick={() => setNotificationId(item.notificationId ?? null)}
                >
                  <div className="min-w-0 flex-1">{inner}</div>
                  <ChevronRight size={16} className="ml-3 shrink-0 text-subtle" />
                </button>
              );
            }

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  data-testid={`attention-item-${item.id}`}
                  className={className}
                >
                  <div className="min-w-0 flex-1">{inner}</div>
                  <ChevronRight size={16} className="ml-3 shrink-0 text-subtle" />
                </Link>
              );
            }

            return (
              <div key={item.id} data-testid={`attention-item-${item.id}`} className={className}>
                <div className="min-w-0 flex-1">{inner}</div>
              </div>
            );
          })}
        </Card.Content>
      </Card>

      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={notificationId !== null}
        onOpenChange={(open) => {
          if (!open) setNotificationId(null);
        }}
      />
    </>
  );
}
