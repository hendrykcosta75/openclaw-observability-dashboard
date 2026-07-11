import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { loadSnapshotInputs } from "@/lib/openclaw-snapshot-server";
import { buildSnapshotView } from "@/lib/openclaw-snapshot";
import { loadPricingTable } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const { snapshot, ledger } = await loadSnapshotInputs();
  const pricing = await loadPricingTable();
  const view = buildSnapshotView(snapshot, ledger, pricing);

  return NextResponse.json(view, {
    headers: { "Cache-Control": "no-store" },
  });
}
