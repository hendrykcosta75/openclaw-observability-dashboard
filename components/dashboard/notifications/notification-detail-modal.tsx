"use client";

import { Button, Modal } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import type { DashboardNotification } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";

export function NotificationDetailModal({
  notification,
  isOpen,
  onOpenChange,
}: {
  notification: DashboardNotification | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!notification) {
    return null;
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="border border-border-dim bg-surface sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-[rgba(239,68,68,0.12)] text-red-400">
              <AlertTriangle className="size-5" />
            </Modal.Icon>
            <Modal.Heading className="text-heading">{notification.title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <p className="text-sm text-body">{notification.summary}</p>
            <div className="grid gap-2">
              {notification.details.map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5 rounded-[12px] border border-border-dim bg-dim/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>{item.label}</span>
                  <span className="text-sm text-heading sm:text-right" style={mono}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-[12px] border border-[rgba(255,107,44,0.16)] bg-[rgba(255,107,44,0.06)] px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>Ação sugerida</p>
              <p className="mt-1 text-sm text-body">{notification.suggestedAction}</p>
            </div>
            <p className="text-xs text-subtle" style={mono}>
              Detectado em {notification.detectedAt} · {notification.source}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">Fechar</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
