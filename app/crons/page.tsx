import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { CronsPage } from "@/components/dashboard/pages/crons-page";
import { SnapshotProvider } from "@/components/dashboard/snapshot-context";
import { requireAuth } from "@/lib/require-auth";
import { loadSnapshotInputs } from "@/lib/openclaw-snapshot-server";
import { buildSnapshotView } from "@/lib/openclaw-snapshot";
import { loadPricingTable } from "@/lib/pricing";

export default async function CronsRoute() {
  await requireAuth();
  const { snapshot, ledger } = await loadSnapshotInputs();
  const pricing = await loadPricingTable();
  const view = buildSnapshotView(snapshot, ledger, pricing);

  return (
    <SnapshotProvider initialView={view}>
      <DetailDashboardLayout>
        <CronsPage />
      </DetailDashboardLayout>
    </SnapshotProvider>
  );
}
