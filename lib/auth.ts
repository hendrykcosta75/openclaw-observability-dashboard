import crypto from "crypto";

export const AUTH_COOKIE_NAME = "openclaw_dashboard_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

type RequiredAuthEnv = "DASHBOARD_AUTH_USER" | "DASHBOARD_AUTH_PASSWORD" | "AUTH_SECRET";

type LoginAttemptBucket = {
  count: number;
  resetAt: number;
};

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const loginAttempts = new Map<string, LoginAttemptBucket>();

function requireEnv(name: RequiredAuthEnv) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  if (name === "AUTH_SECRET" && value.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return value;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", requireEnv("AUTH_SECRET"))
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function shouldUseSecureCookie() {
  return process.env.AUTH_COOKIE_SECURE === "true";
}

export function getLoginRateLimitKey(request: Request, username: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "local";
  const normalizedUser = username.trim().toLowerCase() || "empty";
  return `${ip}:${normalizedUser}`;
}

export function checkLoginRateLimit(key: string, nowMs = Date.now()) {
  const bucket = loginAttempts.get(key);
  if (!bucket || bucket.resetAt <= nowMs) {
    loginAttempts.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= LOGIN_MAX_FAILURES) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - nowMs) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedLogin(key: string, nowMs = Date.now()) {
  const bucket = loginAttempts.get(key);
  if (!bucket || bucket.resetAt <= nowMs) {
    loginAttempts.set(key, { count: 1, resetAt: nowMs + LOGIN_WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function clearLoginRateLimit(key: string) {
  loginAttempts.delete(key);
}

export function isValidCredentials(username: string, password: string) {
  return (
    safeEqual(username, requireEnv("DASHBOARD_AUTH_USER")) &&
    safeEqual(password, requireEnv("DASHBOARD_AUTH_PASSWORD"))
  );
}

export function createSessionToken(username: string, nowMs = Date.now()) {
  const now = Math.floor(nowMs / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined | null, nowMs = Date.now()) {
  if (!token) return null;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  const expected = sign(encodedPayload);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    const now = Math.floor(nowMs / 1000);

    if (!payload.sub || typeof payload.exp !== "number" || payload.exp < now) {
      return null;
    }

    if (payload.sub !== requireEnv("DASHBOARD_AUTH_USER")) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
