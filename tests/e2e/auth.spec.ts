import { expect, test } from "@playwright/test";

const username = process.env.DASHBOARD_AUTH_USER ?? "admin";
const password = process.env.DASHBOARD_AUTH_PASSWORD ?? "local-test-password";

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Dashboard login" })).toBeVisible();
});

test("rejects invalid credentials", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill("wrong-password");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Usuário ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("rate limits repeated invalid credentials", async ({ request }) => {
  const user = `ratelimit-${Date.now()}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request.post("/api/auth/login", {
      data: { username: user, password: "wrong-password" },
    });
    expect(response.status()).toBe(401);
  }

  const response = await request.post("/api/auth/login", {
    data: { username: user, password: "wrong-password" },
  });
  expect(response.status()).toBe(429);
  expect(response.headers()["retry-after"]).toBeTruthy();
});

test("authenticates valid credentials and logs out", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Visão Geral" })).toBeVisible();
  await expect(page.getByText("Resumo do que precisa de atenção hoje.")).toBeVisible();
  await expect(page.getByText("OpenClaw Operations")).toHaveCount(0);
  await expect(page.locator("aside").getByRole("link", { name: /Logs/ })).toBeVisible();
  await expect(page.locator("aside").getByRole("link", { name: /Agentes/ })).toBeVisible();
  await expect(page.locator("section#dashboard").getByText("Custo hoje", { exact: true })).toBeVisible();
  await expect(page.getByTestId("cost-kpi-cost-today")).toContainText("R$ 52,60");
  await expect(page.locator("section#dashboard").getByText("Tokens", { exact: true })).toHaveCount(0);
  await expect(page.locator("section#dashboard").getByText("Tasks", { exact: true })).toHaveCount(0);
  await expect(page.locator("section#dashboard").getByText("Memória", { exact: true })).toHaveCount(0);
  await expect(page.locator("section#dashboard [data-testid='cost-kpi-grid']")).toBeVisible();
  await expect(page.locator("section#dashboard [data-testid='cost-kpi-grid'] button")).toHaveCount(4);
  await expect(page.locator("section#dashboard").getByText("Sem coleta", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Plano de evolução")).toHaveCount(0);
  await expect(page.getByText("Baisync-like UI harness")).toHaveCount(0);
  await expect(page.getByText("Pipeline de coleta")).toHaveCount(0);
  await expect(page.getByText("Custo por agente")).toBeVisible();
  await expect(page.getByText("Últimos 7 dias · valores estimados")).toBeVisible();
  await expect(page.getByText("Custo ao Longo do Tempo")).toHaveCount(0);
  await expect(page.locator("body")).toContainText(/Custo por agente[\s\S]*Saúde dos serviços/);
  await expect(page.getByRole("img", { name: "OpenClaw", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Perfil OpenClaw" })).toBeVisible();
  await expect(page.getByText("Uso ao Longo do Tempo")).toHaveCount(0);
  await expect(page.getByText("Requisições e tokens por dia — últimos 14 dias")).toHaveCount(0);
  await expect(page.getByText("Problemas recentes")).toBeVisible();
  await expect(page.getByText("Crons e timers")).toHaveCount(0);
  await expect(page.getByText("Aprovações contato")).toHaveCount(0);
  await expect(page.getByText("Notes proposals")).toHaveCount(0);
  await expect(page.getByText("Notes errors")).toHaveCount(0);
  await expect(page.getByText("agendamento-notes")).toBeVisible();
  await expect(page.getByText("0 erros · 432 eventos ok nas últimas 24h")).toBeVisible();
  await expect(page.getByText("Ver logs completos")).toBeVisible();
  await expect(page.getByTestId("detail-links-row")).toBeVisible();
  await expect(page.getByRole("button", { name: "Notificações" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible();
  await expect(page.locator("section#dashboard").getByText("Snapshot", { exact: true })).toHaveCount(0);
  await expect(page.locator("section#dashboard").getByText("Coleta agregada do VPS OpenClaw.", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Gateway 200")).toHaveCount(0);
  await expect(page.getByText("Atenção", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/^OK$/)).toHaveCount(0);

  await page.getByRole("button", { name: "Perfil" }).click();
  await page.getByRole("menuitem", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("mobile navbar opens Baisync-style navigation drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");

  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Painel", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir navegação" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Notificações" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible();

  await expect(page.locator("aside").getByRole("link", { name: /Logs/ })).not.toBeInViewport();
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await expect(page.getByRole("button", { name: "Fechar navegação" })).toBeVisible();
  await expect(page.locator("aside").getByRole("link", { name: /Dashboard/ })).toBeVisible();
  await expect(page.locator("aside").getByRole("link", { name: /Logs/ })).toBeVisible();
  await expect(page.locator("aside").getByRole("link", { name: /Agentes/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Plano/ })).toHaveCount(0);

  await page.locator("aside").getByRole("link", { name: /Logs/ }).click();
  await expect(page).toHaveURL(/\/logs$/);
  await expect(page.getByRole("heading", { name: "Logs e estados" })).toBeVisible();
});
