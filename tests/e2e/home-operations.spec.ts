import { expect, test } from "@playwright/test";

const username = process.env.DASHBOARD_AUTH_USER ?? "admin";
const password = process.env.DASHBOARD_AUTH_PASSWORD ?? "local-test-password";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("home shows operational overview sections", async ({ page }) => {
  await expect(page.getByTestId("day-status-banner")).toBeVisible();
  await expect(page.getByText("1 problema ativo")).toBeVisible();
  await expect(page.getByText("Atualizado 03/07 às 13:40")).toBeVisible();

  await expect(page.getByTestId("attention-panel")).toBeVisible();
  await expect(page.getByTestId("attention-item-whatsapp-offline")).toBeVisible();
  await expect(page.getByTestId("attention-item-contact-approvals")).toBeVisible();

  await expect(page.getByTestId("flow-summary-cards")).toBeVisible();
  await expect(page.getByTestId("flow-card-medico")).toBeVisible();
  await expect(page.getByText("2 agendamentos em andamento")).toBeVisible();
  await expect(page.getByText("4 propostas aguardando revisão")).toBeVisible();

  await expect(page.getByTestId("cost-context-line")).toBeVisible();
  await expect(page.getByText(/Marketing responde por 58%/)).toBeVisible();

  await expect(page.getByTestId("whatsapp-status-card")).toBeVisible();
  const whatsappCard = page.getByTestId("whatsapp-status-card");
  await expect(whatsappCard.getByText("WhatsApp médico")).toBeVisible();
  await expect(whatsappCard.getByText("Desconectado")).toBeVisible();

  await expect(page.getByTestId("activity-timeline")).toBeVisible();
  await expect(page.getByTestId("timeline-item-tl-2")).toBeVisible();

  await expect(page.getByTestId("intent-links-row")).toBeVisible();
  await expect(page.getByText("Ver aprovações pendentes →")).toBeVisible();
});

test("attention whatsapp item opens notification modal", async ({ page }) => {
  await page.getByTestId("attention-item-whatsapp-offline").click();
  const modal = page.getByRole("dialog", { name: "WhatsApp desconectado no Evolution" });
  await expect(modal).toBeVisible();
  await expect(modal.getByText("Instância medico perdeu sessão com o gateway WhatsApp.")).toBeVisible();
});

test("whatsapp status card opens notification modal", async ({ page }) => {
  await page.getByTestId("whatsapp-status-card").click();
  await expect(page.getByRole("dialog", { name: "WhatsApp desconectado no Evolution" })).toBeVisible();
});
