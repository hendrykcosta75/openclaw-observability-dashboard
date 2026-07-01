import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isValidCredentials,
  shouldUseSecureCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

type LoginBody = {
  username?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid user or password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
