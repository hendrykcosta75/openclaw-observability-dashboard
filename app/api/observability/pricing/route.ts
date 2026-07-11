import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { loadPricingTable, savePricingTable, isValidPricingTable } from "@/lib/pricing";
import { PricingTable } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  const table = await loadPricingTable();

  return NextResponse.json(table, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidPricingTable(body)) {
    return NextResponse.json({ error: "Invalid pricing table" }, { status: 400 });
  }

  await savePricingTable(body as PricingTable);

  return NextResponse.json({ ok: true }, { status: 200 });
}
