import DashboardShell from "@/components/dashboard-shell";
import { requireAuth } from "@/lib/require-auth";

export default async function Home() {
  await requireAuth();
  return <DashboardShell />;
}
