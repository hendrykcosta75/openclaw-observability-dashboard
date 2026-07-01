import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { CustosPage } from "@/components/dashboard/pages/custos-page";
import { requireAuth } from "@/lib/require-auth";

export default async function CustosRoute() {
  await requireAuth();
  return (
    <DetailDashboardLayout>
      <CustosPage />
    </DetailDashboardLayout>
  );
}
