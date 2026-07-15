import { expect, test } from "@playwright/test";
import { readFile, rename, writeFile } from "node:fs/promises";
import fixture from "../fixtures/openclaw-snapshot.json";

const username = process.env.DASHBOARD_AUTH_USER ?? "admin";
const password = process.env.DASHBOARD_AUTH_PASSWORD ?? "local-test-password";
const snapshotPath = process.env.OPENCLAW_SNAPSHOT_PATH;

async function login(page: import("@playwright/test").Page) {
  const response = await page.request.post("/api/auth/login", {
    data: { username, password },
  });
  expect(response.status()).toBe(200);
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
}

async function navigateFromSidebar(page: import("@playwright/test").Page, href: string) {
  const link = page.locator(`aside a[href="${href}"]`);
  await expect(link).toHaveAttribute("href", href);
  await page.goto(href);
}

function fmtTokens(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(".", ",")}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

test("snapshot API requires a session", async ({ request }) => {
  const response = await request.get("/api/observability/snapshot");
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("authenticated dashboard uses the fixture and shows real values", async ({ page }) => {
  await login(page);

  await expect(page.getByRole("heading", { name: "Visão Geral" })).toBeVisible();
  await expect(page.getByTestId("cost-context-line")).toContainText(`${fmtTokens(fixture.tokens.total)} tokens; ledger diário indisponível`);
  await expect(page.getByTestId("cost-kpi-cost-today")).toContainText(/US\$\s*\d+,\d{2}/);
  const chart = page.getByTestId("agent-cost-bar-chart");
  await expect(chart.getByText("Médico", { exact: true })).toBeVisible();
  await expect(chart.getByText("Notas", { exact: true })).toBeVisible();
  await expect(page.locator("aside").getByRole("link", { name: "Agentes" })).toBeVisible();
  await expect(page.getByText("openclaw-gateway")).toBeVisible();
  await expect(page.getByText("Custo monetário não disponível para Codex OAuth nesta coleta")).toHaveCount(0);
  await expect(page.getByText(/US\$/).first()).toBeVisible();
  await expect(page.getByText(/price map|fictional timeline|\bMock\b/i)).toHaveCount(0);
  await expect(page.locator("aside").getByRole("link", { name: "Gateway" })).toBeVisible();

  const api = await page.evaluate(async () => {
    const response = await fetch("/api/observability/snapshot", { cache: "no-store" });
    return { status: response.status, cache: response.headers.get("cache-control"), data: await response.json() };
  });
  expect(api.status).toBe(200);
  expect(api.cache).toContain("no-store");
  expect(api.data.snapshotMeta.collectedAt).toBe(fixture.collected_at);
  expect(api.data.agentCostRows).toHaveLength(fixture.agents.length);
  expect(api.data.costContextInsight.line).toContain(`${fmtTokens(fixture.tokens.total)} tokens; ledger diário indisponível`);
  expect(api.data.attentionItems.map((item: { id: string }) => item.id)).toEqual(
    expect.arrayContaining(["whatsapp-offline", "contact-approvals", "notes-review"]),
  );
  expect(JSON.stringify(api.data).toLowerCase()).not.toContain("api_key");
  expect(JSON.stringify(api.data).toLowerCase()).not.toContain("password");
});

test("detail navigation and logout remain available", async ({ page }) => {
  await login(page);
  await navigateFromSidebar(page, "/gateway");
  await expect(page).toHaveURL(/\/gateway$/);
  await expect(page.getByRole("heading", { name: "Gateway", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mapa de portas", exact: true })).toBeVisible();
  await expect(page.getByText(":3100", { exact: true })).toBeVisible();
  await expect(page.getByText("127.0.0.1", { exact: true }).first()).toBeVisible();

  await navigateFromSidebar(page, "/custos");
  await expect(page).toHaveURL(/\/custos$/);
  await expect(page.getByRole("heading", { name: "Custos" })).toBeVisible();
  await expect(page.getByText("Tokens coletados do snapshot real com input e output discriminados.")).toBeVisible();
  await expect(page.getByText(/US\$/).first()).toBeVisible();

  await navigateFromSidebar(page, "/custos/precos");
  await expect(page).toHaveURL(/\/custos\/precos$/);
  await expect(page.getByRole("heading", { name: "Preços de modelos" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Chave interna" }).first()).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Input USD por 1M tokens" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();

  const logoutResponse = await page.request.post("/api/auth/logout");
  expect(logoutResponse.status()).toBe(200);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("pricing config page loads and saves an updated rate", async ({ page }) => {
  await login(page);
  await page.goto("/custos/precos");

  await expect(page.getByRole("heading", { name: "Preços de modelos" })).toBeVisible();
  const inputField = page.getByRole("spinbutton", { name: "Input USD por 1M tokens" }).first();
  await inputField.fill("1.23");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Tabela salva com sucesso.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("spinbutton", { name: "Input USD por 1M tokens" }).first()).toHaveValue("1.23");
});

test("dashboard polls an atomically replaced fixture", async ({ page }) => {
  test.skip(!snapshotPath, "fixture path is required for polling coverage");
  const original = await readFile(snapshotPath!, "utf8");
  try {
    await login(page);
    await expect(page.getByTestId("cost-context-line")).toContainText(`${fmtTokens(fixture.tokens.total)} tokens; ledger diário indisponível`);
    const nextSnapshot = JSON.parse(original) as typeof fixture;
    nextSnapshot.tokens.total = 2_400_000;
    nextSnapshot.tokens.by_agent[0].tokens_used = 900_000;
    nextSnapshot.tokens.by_agent[0].tokens.input = 900_000;
    nextSnapshot.tokens.by_agent[0].tokens.output = 0;
    const next = `${JSON.stringify(nextSnapshot, null, 2)}\n`;
    const temporary = `${snapshotPath}.next`;
    await writeFile(temporary, next, "utf8");
    await rename(temporary, snapshotPath!);
    await expect(page.getByTestId("cost-context-line")).toContainText("2,4M tokens; ledger diário indisponível", { timeout: 22_000 });
    await page.goto("/agentes");
    await expect(page.getByText(/\d+\s*k tokens \/ snapshot/i).first()).toBeVisible({ timeout: 22_000 });
  } finally {
    if (snapshotPath) await writeFile(snapshotPath, original, "utf8");
  }
});

test("home page does not contain mock data, sample pricing, price map, or fictional timeline", async ({ page }) => {
  await login(page);

  await expect(page.getByRole("heading", { name: "Visão Geral" })).toBeVisible();
  const bodyText = await page.locator("body").textContent();
  expect(bodyText).toBeTruthy();
  expect(bodyText).not.toContain("price map");
  expect(bodyText).not.toContain("fictional timeline");
  expect(bodyText).not.toContain("Mock");
  expect(bodyText).toMatch(/US\$\s*\d+,\d{2}/);
  expect(bodyText).not.toMatch(/fictional/i);
});

test("costs page shows real snapshot instrumentation and calculated currency", async ({ page }) => {
  await login(page);
  await page.goto("/custos");

  await expect(page.getByRole("heading", { name: "Custos" })).toBeVisible();
  await expect(page.getByText("Tokens coletados do snapshot real com input e output discriminados.")).toBeVisible();
  await expect(page.getByText("Custo ao Longo do Tempo")).toBeVisible();
  await expect(page.getByText(/US\$/).first()).toBeVisible();

  const bodyText = await page.locator("body").textContent();
  expect(bodyText).not.toContain("Mock");
  expect(bodyText).not.toMatch(/fictional/i);
});
