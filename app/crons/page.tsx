import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { CronsPage } from "@/components/dashboard/pages/crons-page";
import { requireAuth } from "@/lib/require-auth";

export default async function CronsRoute() {
  await requireAuth();
  return (
    <DetailDashboardLayout>
      <CronsPage />
    </DetailDashboardLayout>
  );
}
