import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const fixturePath = path.resolve(process.cwd(), "tests/fixtures/openclaw-snapshot.json");
const runtimeDir = path.resolve(process.cwd(), ".hermes/playwright");
const runtimeSnapshotPath = path.join(runtimeDir, "openclaw-snapshot.json");
const missingLedgerPath = path.join(runtimeDir, "openclaw-token-ledger.missing.json");
mkdirSync(runtimeDir, { recursive: true });
copyFileSync(fixturePath, runtimeSnapshotPath);
rmSync(missingLedgerPath, { force: true });
process.env.OPENCLAW_SNAPSHOT_PATH = runtimeSnapshotPath;
process.env.OPENCLAW_TOKEN_LEDGER_PATH = missingLedgerPath;

const authUser = process.env.DASHBOARD_AUTH_USER ?? "admin";
const authPassword = process.env.DASHBOARD_AUTH_PASSWORD ?? "local-test-password";
const authSecret = process.env.AUTH_SECRET ?? "local-test-secret-with-at-least-32-characters";
const testPort = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `yarn dev --webpack --hostname 127.0.0.1 --port ${testPort}`,
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      DASHBOARD_AUTH_USER: authUser,
      DASHBOARD_AUTH_PASSWORD: authPassword,
      AUTH_SECRET: authSecret,
      AUTH_COOKIE_SECURE: "false",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
