import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { LogsPage } from "@/components/dashboard/pages/logs-page";
import { requireAuth } from "@/lib/require-auth";

export default async function LogsRoute() {
  await requireAuth();
  return (
    <DetailDashboardLayout>
      <LogsPage />
    </DetailDashboardLayout>
  );
}
