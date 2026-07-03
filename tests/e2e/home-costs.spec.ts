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
});
