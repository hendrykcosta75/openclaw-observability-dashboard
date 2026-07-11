import { expect, test } from "@playwright/test";
import snapshot from "../fixtures/openclaw-snapshot.json";

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
  const collectedAtLabel = new Date(snapshot.collected_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  await expect(page.getByTestId("day-status-banner")).toBeVisible();
  await expect(page.getByText("1 problema ativo")).toBeVisible();
  await expect(page.getByText(`Atualizado ${collectedAtLabel}`)).toBeVisible();

  await expect(page.getByTestId("attention-panel")).toBeVisible();
  await expect(page.getByTestId("attention-item-whatsapp-offline")).toBeVisible();
  await expect(page.getByTestId("attention-item-contact-approvals")).toBeVisible();
  await expect(page.getByTestId("attention-item-contact-approvals")).toContainText("1 · Aprovações de contato pendentes");

  await expect(page.getByTestId("flow-summary-cards")).toBeVisible();
  await expect(page.getByTestId("flow-card-medico")).toBeVisible();
  const medicalHeadline = snapshot.flows.medical.pending > 0
    ? `${snapshot.flows.medical.completed} concluídos · ${snapshot.flows.medical.pending} pendentes`
    : `${snapshot.flows.medical.completed} agendamentos concluídos`;
  await expect(page.getByTestId("flow-card-medico").getByText(medicalHeadline, { exact: true })).toBeVisible();
  await expect(page.getByTestId("flow-card-notes").getByText(`${snapshot.flows.notes.proposal_statuses.pending_review} propostas aguardando revisão`, { exact: true })).toBeVisible();

  await expect(page.getByTestId("cost-context-line")).toBeVisible();
  await expect(page.getByTestId("cost-context-line")).toContainText(/Acumulado no snapshot: US\$\s*\d+,\d{2}.*tokens; ledger diário indisponível/);

  await expect(page.getByTestId("activity-timeline")).toBeVisible();
  await expect(page.getByTestId("timeline-item-tl-medical")).toBeVisible();
  await expect(page.getByTestId("timeline-item-tl-notes")).toBeVisible();

  await expect(page.getByTestId("intent-links-row")).toBeVisible();
  await expect(page.getByText("Ver aprovações pendentes →")).toBeVisible();
});

test("attention whatsapp item opens notification modal", async ({ page }) => {
  await page.getByTestId("attention-item-whatsapp-offline").click();
  const modal = page.getByRole("dialog", { name: "WhatsApp desconectado no Evolution" });
  await expect(modal).toBeVisible();
  await expect(modal.getByText("A instância WhatsApp não está conectada na Evolution.")).toBeVisible();
});
