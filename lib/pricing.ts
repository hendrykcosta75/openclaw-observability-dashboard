import "server-only";

import * as fs from "fs/promises";
import * as path from "path";
import { openAiRates } from "./openclaw-config";
import { CostCalculationBasis } from "./openclaw-snapshot-types";

export interface PricingModel extends CostCalculationBasis {
  input: number;
  output: number;
}

export type PricingTable = Record<string, PricingModel>;

interface LegacyPricingFile {
  models?: PricingModel[];
}

const DATA_DIR = path.join(process.cwd(), "data");

export const DEFAULT_MODEL_PRICING_PATH = path.join(DATA_DIR, "model-pricing.json");

function resolvePricingPath(): string {
  const configured = process.env.MODEL_PRICING_PATH;
  return configured ? path.resolve(configured) : DEFAULT_MODEL_PRICING_PATH;
}

function normalizePricingModel(m: PricingModel): PricingModel {
  const inputRateUsdPer1M = Number(m.inputRateUsdPer1M ?? m.input ?? 0);
  const outputRateUsdPer1M = Number(m.outputRateUsdPer1M ?? m.output ?? 0);
  return {
    provider: m.provider || "openai",
    modelId: m.modelId || "",
    inputRateUsdPer1M,
    outputRateUsdPer1M,
    inputRatePer1M: m.inputRatePer1M || `US$ ${inputRateUsdPer1M.toFixed(2).replace(".", ",")} / 1M tokens`,
    outputRatePer1M: m.outputRatePer1M || `US$ ${outputRateUsdPer1M.toFixed(2).replace(".", ",")} / 1M tokens`,
    input: inputRateUsdPer1M,
    output: outputRateUsdPer1M,
  };
}

function toPricingRecord(rates: Record<string, CostCalculationBasis>): PricingTable {
  return Object.fromEntries(
    Object.entries(rates).map(([key, basis]) => [
      key,
      normalizePricingModel({
        ...basis,
        input: basis.inputRateUsdPer1M,
        output: basis.outputRateUsdPer1M,
      } as PricingModel),
    ]),
  );
}

function legacyToPricingTable(legacy: LegacyPricingFile): PricingTable | null {
  if (!Array.isArray(legacy.models)) return null;
  const table: PricingTable = {};
  for (const model of legacy.models) {
    const normalized = normalizePricingModel(model);
    if (!normalized.modelId) continue;
    const key = (model as { key?: string }).key || normalized.modelId.toLowerCase().replace(/[^a-z0-9]/g, "");
    table[key] = normalized;
  }
  return Object.keys(table).length > 0 ? table : null;
}

export async function initializeModelPricing(): Promise<void> {
  const pricingPath = resolvePricingPath();
  try {
    await fs.access(pricingPath);
  } catch {
    await fs.mkdir(path.dirname(pricingPath), { recursive: true });
    const defaults = toPricingRecord(openAiRates);
    await writePricingTable(pricingPath, defaults);
  }
}

async function writePricingTable(pricingPath: string, table: PricingTable): Promise<void> {
  const tempPath = `${pricingPath}.tmp.${process.pid}.${Date.now()}`;
  const encoded = JSON.stringify(table, null, 2) + "\n";
  const handle = await fs.open(tempPath, "w", 0o640);
  try {
    await handle.writeFile(encoded);
    await handle.sync();
  } finally {
    await handle.close();
  }
  await fs.rename(tempPath, pricingPath);
}

export async function savePricingTable(table: PricingTable): Promise<void> {
  const pricingPath = resolvePricingPath();
  const normalized: PricingTable = {};
  for (const [key, model] of Object.entries(table)) {
    normalized[key] = normalizePricingModel(model);
  }
  await writePricingTable(pricingPath, normalized);
}

export function isValidPricingModel(value: unknown): value is PricingModel {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const inputRateUsdPer1M = Number(v.inputRateUsdPer1M ?? v.input ?? 0);
  const outputRateUsdPer1M = Number(v.outputRateUsdPer1M ?? v.output ?? 0);
  return (
    typeof v.provider === "string" &&
    v.provider.length > 0 &&
    typeof v.modelId === "string" &&
    v.modelId.length > 0 &&
    Number.isFinite(inputRateUsdPer1M) &&
    inputRateUsdPer1M >= 0 &&
    Number.isFinite(outputRateUsdPer1M) &&
    outputRateUsdPer1M >= 0 &&
    typeof v.input === "number" &&
    typeof v.output === "number"
  );
}

export function isValidPricingTable(value: unknown): value is PricingTable {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return false;
  return entries.every(([key, model]) => key.length > 0 && isValidPricingModel(model));
}

export function isLegacyPricingFile(value: unknown): value is LegacyPricingFile {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.models)) return false;
  return v.models.every((m) => isValidPricingModel(m));
}

export async function loadPricingTable(): Promise<PricingTable> {
  const pricingPath = resolvePricingPath();
  await initializeModelPricing();
  try {
    const raw = await fs.readFile(pricingPath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (isValidPricingTable(parsed)) return parsed;
    const legacy = isLegacyPricingFile(parsed) ? legacyToPricingTable(parsed) : null;
    if (legacy) return legacy;
  } catch {
    // fall through to defaults
  }
  return toPricingRecord(openAiRates);
}
