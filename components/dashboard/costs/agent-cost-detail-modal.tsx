"use client";

import { Button, Modal } from "@heroui/react";
import { Bot } from "lucide-react";
import type { AgentCostRow } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";

function fmtBrl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  const parts = iso.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return iso;
}

export function AgentCostDetailModal({
  agent,
  isOpen,
  onOpenChange,
}: {
  agent: AgentCostRow | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!agent) {
    return null;
  }

  const peakDay = agent.dailyCosts.reduce((max, day) => (day.cost > max.cost ? day : max), agent.dailyCosts[0]);
  const avgDaily = agent.cost7d / agent.dailyCosts.length;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="border border-border-dim bg-surface sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-[rgba(255,107,44,0.12)] text-[#D4835A]">
              <Bot className="size-5" />
            </Modal.Icon>
            <Modal.Heading className="text-heading">Custo · {agent.label}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <div className="grid gap-2">
              {[
                { label: "Total 7 dias", value: fmtBrl(agent.cost7d) },
                { label: "Hoje", value: fmtBrl(agent.costToday) },
                { label: "Média diária", value: fmtBrl(avgDaily) },
                { label: "Dia mais caro", value: `${fmtDate(peakDay.date)} · ${fmtBrl(peakDay.cost)}` },
                { label: "Participação", value: `${agent.sharePercent}% do total` },
                { label: "ID", value: agent.agentId },
              ].map((item) => (
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
