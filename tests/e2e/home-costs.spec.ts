import { expect, test } from "@playwright/test";

const username = process.env.DASHBOARD_AUTH_USER ?? "admin";
const password = process.env.DASHBOARD_AUTH_PASSWORD ?? "local-test-password";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/$/);
}

test("cost kpi card opens detail modal", async ({ page }) => {
  await login(page);

  await page.getByTestId("cost-kpi-cost-today").click();

  await expect(page.getByRole("dialog", { name: "Custo de hoje" })).toBeVisible();
  await expect(page.getByText("Marketing · R$ 30,50")).toBeVisible();
  await expect(page.getByText("Acima da média")).toBeVisible();
  await expect(page.getByTestId("cost-calculation-panel")).toBeVisible();
  await expect(page.getByText("Tokens input")).toBeVisible();
  await expect(page.getByText("Tokens output")).toBeVisible();
  await expect(page.getByText("R$ 12,50 / 1M tokens")).toBeVisible();

  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByRole("dialog", { name: "Custo de hoje" })).toHaveCount(0);
});

test("agent cost bar chart opens agent detail modal", async ({ page }) => {
  await login(page);

  await expect(page.getByTestId("agent-cost-bar-chart")).toBeVisible();
  await page.getByTestId("agent-cost-bar-agente-marketing").click({ force: true });

  const modal = page.getByRole("dialog", { name: "Custo · Marketing" });
  await expect(modal).toBeVisible();
  await expect(modal.getByText("58% do total")).toBeVisible();
  await expect(modal.getByText("agente-marketing")).toBeVisible();
  await expect(modal.getByTestId("cost-calculation-panel")).toBeVisible();
  await expect(modal.getByText("gpt-5-mini")).toBeVisible();
  await expect(modal.getByText("R$ 0,75 / 1M tokens")).toBeVisible();
});

test("monthly cost chart is visible on home", async ({ page }) => {
  await login(page);

  await expect(page.getByText("Evolução de custos por mês")).toBeVisible();
  await expect(page.getByTestId("monthly-cost-chart")).toBeVisible();
  await expect(page.getByTestId("cost-kpi-cost-month")).toBeVisible();
  await expect(page.getByText("Custo do mês", { exact: true })).toBeVisible();
});

test("cost month kpi opens detail modal", async ({ page }) => {
  await login(page);

  await page.getByTestId("cost-kpi-cost-month").click();

  await expect(page.getByRole("dialog", { name: "Custo do mês atual" })).toBeVisible();
  await expect(page.getByText("Julho/2026")).toBeVisible();
  await expect(page.getByText("Junho · R$ 892,40")).toBeVisible();
});
