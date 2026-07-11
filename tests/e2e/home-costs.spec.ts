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

  const modal = page.getByRole("dialog", { name: "Custo de hoje" });
  await expect(modal).toBeVisible();
  await expect(modal.getByText(/Médico · US\$\s*\d+,\d{2}/)).toBeVisible();
  await expect(modal.getByText("Total", { exact: true })).toBeVisible();
  await expect(modal.getByText("Acima da média", { exact: true })).toBeVisible();
  await expect(modal.getByTestId("cost-calculation-panel")).toBeVisible();
  await expect(modal.getByText("Tokens input")).toBeVisible();
  await expect(modal.getByText("Tokens output")).toBeVisible();
  await expect(modal.getByText(/US\$ \d+,\d{2} \/ 1M tokens/).first()).toBeVisible();

  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByRole("dialog", { name: "Custo de hoje" })).toHaveCount(0);
});

test("agent cost bar chart opens agent detail modal", async ({ page }) => {
  await login(page);

  const chart = page.getByTestId("agent-cost-bar-chart");
  await expect(chart).toBeVisible();
  await expect(chart.getByText("Médico", { exact: true })).toBeVisible();
  await expect(chart.getByText("Notas", { exact: true })).toBeVisible();
  await chart.scrollIntoViewIfNeeded();
  await page.locator('path[data-testid="agent-cost-bar-agendamento-medico"]').click({ force: true });

  const modal = page.getByRole("dialog", { name: "Custo · Médico" });
  await expect(modal).toBeVisible();
  await expect(modal.getByText(/\d+% do total/)).toBeVisible();
  await expect(modal.getByText("agendamento-medico")).toBeVisible();
  await expect(modal.getByText(/US\$\s*\d+,\d{2}/).first()).toBeVisible();
  await expect(modal.getByTestId("cost-calculation-panel")).toBeVisible();
  await expect(modal.getByText("gpt-5.4")).toBeVisible();
  await expect(modal.getByText(/US\$ \d+,\d{2} \/ 1M tokens/).first()).toBeVisible();
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

  const modal = page.getByRole("dialog", { name: "Custo do mês atual" });
  await expect(modal).toBeVisible();
  await expect(modal.getByText(/julho de 2026/i)).toBeVisible();
  await expect(modal.getByText("Acumulado", { exact: true })).toBeVisible();
  await expect(modal.getByText(/US\$\s*\d+,\d{2}/).first()).toBeVisible();
  await expect(modal.getByText("Dias registrados", { exact: true })).toBeVisible();
});
