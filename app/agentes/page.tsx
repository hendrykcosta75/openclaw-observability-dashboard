import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { AgentesPage } from "@/components/dashboard/pages/agentes-page";
import { requireAuth } from "@/lib/require-auth";

export default async function AgentesRoute() {
  await requireAuth();
  return (
    <DetailDashboardLayout>
      <AgentesPage />
    </DetailDashboardLayout>
  );
}
