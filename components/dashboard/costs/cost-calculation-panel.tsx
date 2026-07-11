"use client";

import type { CostCalculationBasis, TokenSpend } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";

export function fmtTokens(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  }
  return value.toLocaleString("pt-BR");
}

export function CostCalculationPanel({
  tokens,
  calculationBases,
}: {
  tokens: TokenSpend;
  calculationBases: CostCalculationBasis[];
}) {
  return (
    <div className="space-y-2 rounded-[12px] border border-[rgba(255,107,44,0.16)] bg-[rgba(255,107,44,0.06)] px-3 py-3" data-testid="cost-calculation-panel">
      <p className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>Base do cálculo</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-[10px] border border-border-dim bg-dim/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>Tokens input</p>
          <p className="mt-1 text-sm text-heading" style={mono}>{fmtTokens(tokens.input)}</p>
        </div>
        <div className="rounded-[10px] border border-border-dim bg-dim/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.14em] text-subtle" style={mono}>Tokens output</p>
          <p className="mt-1 text-sm text-heading" style={mono}>{fmtTokens(tokens.output)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {calculationBases.length > 0 ? calculationBases.map((basis) => (
          <div key={`${basis.provider}-${basis.modelId}`} className="rounded-[10px] border border-border-dim bg-dim/50 px-3 py-2">
            <p className="text-xs text-heading" style={mono}>{basis.provider} · {basis.modelId}</p>
            <p className="mt-1 text-xs text-subtle" style={mono}>Input: {basis.inputRatePer1M}</p>
            <p className="text-xs text-subtle" style={mono}>Output: {basis.outputRatePer1M}</p>
          </div>
        )) : (
          <p className="text-xs text-subtle" style={mono}>Nenhum modelo tarifado observado neste período.</p>
        )}
      </div>
    </div>
  );
}
