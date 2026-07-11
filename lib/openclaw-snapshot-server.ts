import "server-only";

import * as fs from "fs/promises";
import * as path from "path";
import { buildSnapshotView } from "./openclaw-snapshot";
import { OpenClawSnapshot, OpenClawTokenLedger, SnapshotView } from "./openclaw-snapshot-types";
import { loadPricingTable } from "./pricing";

const DATA_DIR = path.join(process.cwd(), "data");

function resolveDataPath(envName: string, fallbackName: string): string {
  const configured = process.env[envName];
  return configured ? path.resolve(configured) : path.join(DATA_DIR, fallbackName);
}

export async function loadSnapshotInputs(): Promise<{ snapshot: OpenClawSnapshot; ledger?: OpenClawTokenLedger }> {
  const snapshotPath = resolveDataPath("OPENCLAW_SNAPSHOT_PATH", "openclaw-snapshot.json");
  const ledgerPath = resolveDataPath("OPENCLAW_TOKEN_LEDGER_PATH", "openclaw-token-ledger.json");

  const snapshotRaw = await fs.readFile(snapshotPath, "utf-8");
  const snapshot = JSON.parse(snapshotRaw) as OpenClawSnapshot;

  let ledger: OpenClawTokenLedger | undefined;
  try {
    const ledgerRaw = await fs.readFile(ledgerPath, "utf-8");
    ledger = JSON.parse(ledgerRaw) as OpenClawTokenLedger;
  } catch {
    ledger = undefined;
  }

  return { snapshot, ledger };
}

export async function readOpenClawSnapshot(): Promise<SnapshotView> {
  const { snapshot, ledger } = await loadSnapshotInputs();
  const pricing = await loadPricingTable();
  return buildSnapshotView(snapshot, ledger, pricing);
}
