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

test("authenticates valid credentials and logs out", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /OpenClaw Operations/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Logs/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Agentes/ })).toBeVisible();
  await expect(page.getByText("Gateway 200")).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
