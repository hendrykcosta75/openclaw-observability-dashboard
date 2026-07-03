"use client";

import { Button, Modal } from "@heroui/react";
import { CircleDollarSign } from "lucide-react";
import type { CostKpiCard } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";

export function CostKpiDetailModal({
  kpi,
  isOpen,
  onOpenChange,
}: {
  kpi: CostKpiCard | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!kpi) {
    return null;
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="border border-border-dim bg-surface sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-[rgba(255,107,44,0.12)] text-[#D4835A]">
              <CircleDollarSign className="size-5" />
            </Modal.Icon>
            <Modal.Heading className="text-heading">{kpi.modalTitle}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <div className="grid gap-2">
              {kpi.modalDetails.map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5 rounded-[12px] border border-border-dim bg-dim/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>{item.label}</span>
                  <span className="text-sm text-heading sm:text-right" style={mono}>{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-subtle" style={mono}>Valores estimados · mock até coletor real</p>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">Fechar</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
