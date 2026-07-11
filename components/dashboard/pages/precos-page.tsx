"use client";

import React, { useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { CircleDollarSign, Plus, Trash2, Save } from "lucide-react";
import { usePricing, type PricingModel } from "@/components/dashboard/use-pricing";
import { mono } from "../shared/mono";
import { SectionTitle } from "../shared/section-title";

interface PricingEntry {
  key: string;
  model: PricingModel;
}

export function PrecosPage() {
  const { table, loading, error, saving, save } = usePricing();
  const [drafts, setDrafts] = useState<Record<string, PricingModel>>({});

  const baseEntries: PricingEntry[] = Object.entries(table)
    .map(([key, model]) => ({ key, model: drafts[key] ?? model }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const newKeys = Object.keys(drafts).filter((k) => !(k in table));
  const newEntries: PricingEntry[] = newKeys
    .map((key) => ({ key, model: drafts[key]! }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const entries = [...baseEntries, ...newEntries];

  function updateEntry(key: string, patch: Partial<PricingModel>) {
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? table[key]!), ...patch },
    }));
  }

  function updateKey(oldKey: string, newKey: string) {
    if (oldKey === newKey) return;
    setDrafts((prev) => {
      const next: Record<string, PricingModel> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (k === oldKey) {
          next[newKey] = v;
        } else {
          next[k] = v;
        }
      }
      // If the old key was not already in drafts, seed the new key from the table.
      if (!(oldKey in prev) && oldKey in table) {
        next[newKey] = table[oldKey]!;
      }
      return next;
    });
  }

  function addModel() {
    const key = `model_${Object.keys(drafts).length + 1}`;
    setDrafts((prev) =>
      ({
        ...prev,
        [key]: {
          provider: "openai",
          modelId: "",
          inputRateUsdPer1M: 0,
          outputRateUsdPer1M: 0,
          inputRatePer1M: "US$ 0,00 / 1M tokens",
          outputRatePer1M: "US$ 0,00 / 1M tokens",
          input: 0,
          output: 0,
        },
      })
    );
  }

  function removeModel(key: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSave() {
    const next: Record<string, PricingModel> = {};
    for (const { key, model } of entries) {
      const sanitizedKey = key.trim() || model.modelId;
      const inputRate = Number(model.inputRateUsdPer1M);
      const outputRate = Number(model.outputRateUsdPer1M);
      next[sanitizedKey] = {
        ...model,
        inputRateUsdPer1M: inputRate,
        outputRateUsdPer1M: outputRate,
        inputRatePer1M: `US$ ${inputRate.toFixed(2).replace(".", ",")} / 1M tokens`,
        outputRatePer1M: `US$ ${outputRate.toFixed(2).replace(".", ",")} / 1M tokens`,
        input: inputRate,
        output: outputRate,
      };
    }
    void save(next).then(() => setDrafts({}));
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-light tracking-tight text-heading" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}>
          Preços de modelos
        </h1>
        <p className="text-subtle">Editar taxas de input/output em USD por 1M tokens.</p>
      </div>

      <section className="space-y-5">
        <SectionTitle
          eyebrow="Configuração"
          title="Tabela de preços"
          description="Alterações refletem nos custos do dashboard e na API de snapshot."
          icon={CircleDollarSign}
        />

        {loading && <p className="text-subtle">Carregando...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.key} className="glass-card p-4">
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-subtle" style={mono}>Chave</label>
                  <Input
                    value={entry.key}
                    onChange={(e) => updateKey(entry.key, e.target.value)}
                    className="w-full"
                    aria-label="Chave interna"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-subtle" style={mono}>Provider</label>
                  <Input
                    value={entry.model.provider}
                    onChange={(e) => updateEntry(entry.key, { provider: e.target.value })}
                    aria-label="Provider"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-subtle" style={mono}>Model ID</label>
                  <Input
                    value={entry.model.modelId}
                    onChange={(e) => updateEntry(entry.key, { modelId: e.target.value })}
                    aria-label="Model ID"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-subtle" style={mono}>Input US$/1M</label>
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    value={String(entry.model.inputRateUsdPer1M)}
                    onChange={(e) => updateEntry(entry.key, { inputRateUsdPer1M: Number(e.target.value) })}
                    className="w-full"
                    aria-label="Input USD por 1M tokens"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-[11px] uppercase tracking-wider text-subtle" style={mono}>Output US$/1M</label>
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        value={String(entry.model.outputRateUsdPer1M)}
                        onChange={(e) => updateEntry(entry.key, { outputRateUsdPer1M: Number(e.target.value) })}
                        className="w-full"
                        aria-label="Output USD por 1M tokens"
                      />
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label="Remover modelo"
                      className="h-9 min-w-9 border-none text-subtle hover:text-red-400"
                      onPress={() => removeModel(entry.key)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onPress={addModel} className="gap-2">
            <Plus size={14} />
            Adicionar modelo
          </Button>
          <Button className="bg-primary-500 gap-2 text-white" onPress={handleSave} isDisabled={saving}>
            {saving ? "Salvando..." : (<>
              <Save size={14} />
              Salvar
            </>)}
          </Button>
        </div>

        {!saving && !error && Object.keys(drafts).length === 0 && (
          <p className="text-sm text-emerald-400">Tabela salva com sucesso.</p>
        )}
      </section>
    </div>
  );
}
