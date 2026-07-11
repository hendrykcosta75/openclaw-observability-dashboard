import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { CustosPage } from "@/components/dashboard/pages/custos-page";
import { SnapshotProvider } from "@/components/dashboard/snapshot-context";
import { requireAuth } from "@/lib/require-auth";
import { loadSnapshotInputs } from "@/lib/openclaw-snapshot-server";
import { buildSnapshotView } from "@/lib/openclaw-snapshot";
import { loadPricingTable } from "@/lib/pricing";

export default async function CustosRoute() {
  await requireAuth();
  const { snapshot, ledger } = await loadSnapshotInputs();
  const pricing = await loadPricingTable();
  const view = buildSnapshotView(snapshot, ledger, pricing);

  return (
    <SnapshotProvider initialView={view}>
      <DetailDashboardLayout>
        <CustosPage />
      </DetailDashboardLayout>
    </SnapshotProvider>
  );
}
