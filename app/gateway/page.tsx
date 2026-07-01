import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { GatewayPage } from "@/components/dashboard/pages/gateway-page";
import { requireAuth } from "@/lib/require-auth";

export default async function GatewayRoute() {
  await requireAuth();
  return (
    <DetailDashboardLayout>
      <GatewayPage />
    </DetailDashboardLayout>
  );
}
