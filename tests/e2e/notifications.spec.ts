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

test("dashboard notification opens detail modal", async ({ page }) => {
  await login(page);

  await expect(page.getByText("WhatsApp desconectado no Evolution")).toBeVisible();
  await page.getByTestId("notification-evolution-whatsapp-disconnected").click();

  await expect(page.getByRole("dialog", { name: "WhatsApp desconectado no Evolution" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "WhatsApp desconectado no Evolution" })).toBeVisible();
  await expect(page.getByText("close", { exact: true })).toBeVisible();
  await expect(page.getByText("Reconectar manualmente pelo Evolution Manager.")).toBeVisible();

  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByRole("dialog", { name: "WhatsApp desconectado no Evolution" })).toHaveCount(0);
});

test("header notifications menu opens the same detail modal", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: "Notificações" }).click();
  await page.getByRole("menuitem", { name: /WhatsApp desconectado no Evolution/ }).click();

  const modal = page.getByRole("dialog", { name: "WhatsApp desconectado no Evolution" });
  await expect(modal).toBeVisible();
  await expect(modal.getByText("A instância WhatsApp não está conectada na Evolution.")).toBeVisible();
});
