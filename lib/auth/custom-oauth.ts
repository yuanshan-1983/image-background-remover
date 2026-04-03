import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";
import { getD1Binding, getEnvValue } from "@/lib/cloudflare-env";

const SESSION_COOKIE_NAME = "imd_session";
const OAUTH_STATE_COOKIE_NAME = "imd_oauth_state";
const OAUTH_CODE_VERIFIER_COOKIE_NAME = "imd_oauth_code_verifier";

function nowIso() {
  return new Date().toISOString();
}

function getBaseUrl() {
  return getEnvValue("NEXTAUTH_URL") || getEnvValue("AUTH_URL") || "http://localhost:3000";
}

function getGoogleClientId() {
  return getEnvValue("GOOGLE_CLIENT_ID") || getEnvValue("AUTH_GOOGLE_ID");
}

function getGoogleClientSecret() {
  return getEnvValue("GOOGLE_CLIENT_SECRET") || getEnvValue("AUTH_GOOGLE_SECRET");
}

function getSessionSecret() {
  return getEnvValue("NEXTAUTH_SECRET") || getEnvValue("AUTH_SECRET") || "dev-secret";
}

function textEncoder() {
  return new TextEncoder().encode(getSessionSecret());
}

export function getGoogleCallbackUrl() {
  return `${getBaseUrl()}/api/auth/google/callback`;
}

export function getGoogleAuthUrl(state: string) {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error("Missing Google client id");

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getGoogleCallbackUrl());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForTokens(code: string) {
  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleCallbackUrl(),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  return response.json() as Promise<{
    access_token: string;
    expires_in: number;
    id_token: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
  }>;
}

export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return response.json() as Promise<{
    sub: string;
    email: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  }>;
}

export async function upsertGoogleUser(profile: {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}) {
  const db = getD1Binding();
  if (!db) throw new Error("D1 binding is missing");

  const existing = await db
    .prepare(
      `SELECT u.* FROM accounts a JOIN users u ON u.id = a.user_id WHERE a.provider = 'google' AND a.provider_account_id = ? LIMIT 1`
    )
    .bind(profile.sub)
    .first<{ id: string; email: string; name: string | null; image: string | null }>();

  if (existing) {
    await db
      .prepare(`UPDATE users SET email = ?, name = ?, image = ?, updated_at = ? WHERE id = ?`)
      .bind(profile.email, profile.name ?? null, profile.picture ?? null, nowIso(), existing.id)
      .run();
    return existing.id;
  }

  const userId = uuidv4();
  const accountId = uuidv4();
  const now = nowIso();

  await db
    .prepare(
      `INSERT INTO users (id, email, name, image, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      userId,
      profile.email,
      profile.name ?? null,
      profile.picture ?? null,
      profile.email_verified ? now : null,
      now,
      now
    )
    .run();

  await db
    .prepare(
      `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, created_at, updated_at)
       VALUES (?, ?, 'oauth', 'google', ?, ?, ?)`
    )
    .bind(accountId, userId, profile.sub, now, now)
    .run();

  return userId;
}

export async function createAppSession(userId: string) {
  const db = getD1Binding();
  if (!db) throw new Error("D1 binding is missing");

  const sessionId = uuidv4();
  const sessionToken = uuidv4();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const now = nowIso();

  await db
    .prepare(
      `INSERT INTO sessions (id, session_token, user_id, expires, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(sessionId, sessionToken, userId, expires, now, now)
    .run();

  const jwt = await new SignJWT({ sessionToken, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(textEncoder());

  return { jwt, expires };
}

export async function verifyAppSession(token: string) {
  const db = getD1Binding();
  if (!db) return null;

  const verified = await jwtVerify(token, textEncoder()).catch(() => null);
  if (!verified) return null;

  const sessionToken = verified.payload.sessionToken;
  if (typeof sessionToken !== "string") return null;

  const session = await db
    .prepare(`SELECT * FROM sessions WHERE session_token = ? LIMIT 1`)
    .bind(sessionToken)
    .first<{ user_id: string; expires: string }>();

  if (!session) return null;
  if (new Date(session.expires).getTime() < Date.now()) return null;

  const user = await db
    .prepare(`SELECT id, email, name, image, plan FROM users WHERE id = ? LIMIT 1`)
    .bind(session.user_id)
    .first<{ id: string; email: string; name: string | null; image: string | null; plan: string }>();

  if (!user) return null;

  return { user };
}

export function buildSessionCookie(token: string) {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function buildStateCookie(state: string) {
  return `${OAUTH_STATE_COOKIE_NAME}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
}

export function clearStateCookie() {
  return `${OAUTH_STATE_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const parts = cookieHeader.split(/;\s*/);
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getStateCookieName() {
  return OAUTH_STATE_COOKIE_NAME;
}

export function generateState() {
  return uuidv4();
}
