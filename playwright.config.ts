import { defineConfig, devices } from "@playwright/test";

const authUser = process.env.DASHBOARD_AUTH_USER ?? "admin";
const authPassword = process.env.DASHBOARD_AUTH_PASSWORD ?? "local-test-password";
const authSecret = process.env.AUTH_SECRET ?? "local-test-secret-with-at-least-32-characters";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "yarn dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/login",
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
