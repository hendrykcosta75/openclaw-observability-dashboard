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

test("sidebar navigates to detail routes", async ({ page }) => {
  await login(page);

  const routes = [
    { link: /Logs/, url: /\/logs$/, heading: "Logs e estados" },
    { link: /Agentes/, url: /\/agentes$/, heading: "Agentes" },
    { link: /Gateway/, url: /\/gateway$/, heading: "Gateway" },
    { link: /Crons/, url: /\/crons$/, heading: "Crons e timers" },
    { link: /Custos/, url: /\/custos$/, heading: "Custos" },
    { link: /Dashboard/, url: /\/$/, heading: "Visão Geral" },
  ] as const;

  const sidebar = page.locator("aside");

  for (const route of routes) {
    await sidebar.getByRole("link", { name: route.link }).click();
    await expect(page).toHaveURL(route.url);
    await expect(page.getByRole("heading", { name: route.heading, exact: true })).toBeVisible();
  }
});

test("detail routes redirect to login when unauthenticated", async ({ page }) => {
  for (const path of ["/logs", "/agentes", "/gateway", "/crons", "/custos"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("logs detail page shows state buckets", async ({ page }) => {
  await login(page);
  await page.goto("/logs");

  await expect(page.getByText("Fluxo médico")).toBeVisible();
  await expect(page.getByText("Notes proposals")).toBeVisible();
  await expect(page.getByText("agendamento-notes", { exact: true })).toBeVisible();
});

test("custos detail page shows instrumentation status", async ({ page }) => {
  await login(page);
  await page.goto("/custos");

  await expect(page.getByText("Tokens coletados do snapshot real com input e output discriminados.")).toBeVisible();
  await expect(page.getByText("Custo ao Longo do Tempo")).toBeVisible();
  await expect(page.getByText("Próximos passos")).toHaveCount(0);
  await expect(page.getByText("Backlog", { exact: true })).toHaveCount(0);
});
