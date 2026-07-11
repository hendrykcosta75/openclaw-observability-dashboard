"use client";

import { useCallback, useEffect, useState } from "react";

export interface PricingModel {
  provider: string;
  modelId: string;
  inputRateUsdPer1M: number;
  outputRateUsdPer1M: number;
  inputRatePer1M: string;
  outputRatePer1M: string;
  input: number;
  output: number;
}

export type PricingTable = Record<string, PricingModel>;

export function usePricing() {
  const [table, setTable] = useState<PricingTable>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/observability/pricing", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as PricingTable;
        if (!cancelled) {
          setTable(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar preços");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (next: PricingTable) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/observability/pricing", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${response.status}`);
      }
      setTable(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar preços");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { table, loading, saving, error, save };
}

// Keep an empty export to satisfy any downstream import that might reference the file type.
export type {};
