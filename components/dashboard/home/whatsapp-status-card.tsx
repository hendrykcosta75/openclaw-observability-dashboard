"use client";

import React from "react";
import { Card } from "@heroui/react";
import { MessageCircle, ChevronRight } from "lucide-react";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { NotificationDetailModal } from "../notifications/notification-detail-modal";
import { HealthMark } from "../shared/health-mark";
import { mono } from "../shared/mono";

export function WhatsAppStatusCard() {
  const { whatsAppChannelStatus, dashboardNotifications } = useSnapshot();
  const [open, setOpen] = React.useState(false);
  const notification = dashboardNotifications.find((item) => item.id === "evolution-whatsapp-disconnected") ?? null;

  return (
    <>
      <button
        type="button"
        className="w-full text-left"
        data-testid="whatsapp-status-card"
        onClick={() => setOpen(true)}
      >
        <Card className={`p-4 transition-colors hover:border-[rgba(255,107,44,0.2)] ${whatsAppChannelStatus.connected ? "" : "border-red-500/20"}`}>
          <Card.Header className="flex flex-row items-center justify-between p-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-[#D4835A]" />
              <Card.Title className="text-base text-heading" style={mono}>WhatsApp médico</Card.Title>
            </div>
            <HealthMark tone={whatsAppChannelStatus.tone} />
          </Card.Header>
          <Card.Content className="mt-3 space-y-2 p-0">
            <p className="text-lg font-medium text-heading" style={mono}>{whatsAppChannelStatus.headline}</p>
            <p className="text-sm text-body">{whatsAppChannelStatus.impact}</p>
            <p className="text-xs text-subtle">{whatsAppChannelStatus.lastActiveLabel}</p>
            <div className="flex items-center gap-1 pt-1 text-[11px] text-[#D4835A]" style={mono}>
              Ver detalhes
              <ChevronRight size={12} />
            </div>
          </Card.Content>
        </Card>
      </button>

      <NotificationDetailModal
        notification={notification}
        isOpen={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
