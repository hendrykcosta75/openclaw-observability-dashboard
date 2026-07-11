import { DetailDashboardLayout } from "@/components/dashboard/detail-layout";
import { AgentesPage } from "@/components/dashboard/pages/agentes-page";
import { SnapshotProvider } from "@/components/dashboard/snapshot-context";
import { requireAuth } from "@/lib/require-auth";
import { loadSnapshotInputs } from "@/lib/openclaw-snapshot-server";
import { buildSnapshotView } from "@/lib/openclaw-snapshot";
import { loadPricingTable } from "@/lib/pricing";
 
export default async function AgentesRoute() {
  await requireAuth();
  const { snapshot, ledger } = await loadSnapshotInputs();
  const pricing = await loadPricingTable();
  const view = buildSnapshotView(snapshot, ledger, pricing);
 
  return (
    <SnapshotProvider initialView={view}>
      <DetailDashboardLayout>
        <AgentesPage />
      </DetailDashboardLayout>
    </SnapshotProvider>
  );
}
