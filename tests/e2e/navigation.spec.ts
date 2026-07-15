import { expect, test } from "@playwright/test";

const username = process.env.DASHBOARD_AUTH_USER ?? "admin";
const password = process.env.DASHBOARD_AUTH_PASSWORD ?? "local-test-password";

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

test("sidebar navigates to detail routes", async ({ page }) => {
  await login(page);

  const routes = [
    { href: "/logs", url: /\/logs$/, heading: "Logs e estados" },
    { href: "/agentes", url: /\/agentes$/, heading: "Agentes" },
    { href: "/gateway", url: /\/gateway$/, heading: "Gateway" },
    { href: "/crons", url: /\/crons$/, heading: "Crons e timers" },
    { href: "/custos", url: /\/custos$/, heading: "Custos" },
    { href: "/", url: /\/$/, heading: "Visão Geral" },
  ] as const;

  for (const route of routes) {
    await navigateFromSidebar(page, route.href);
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
