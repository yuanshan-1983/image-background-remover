import { NextRequest, NextResponse } from "next/server";
import {
  buildSessionCookie,
  clearStateCookie,
  createAppSession,
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  getStateCookieName,
  readCookie,
  upsertGoogleUser
} from "@/lib/auth/custom-oauth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  globalThis.__OPENCLAW_CF_CTX__ = await getCloudflareContext({ async: true });

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = readCookie(request, getStateCookieName());

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=state", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleUserInfo(tokens.access_token);
    const userId = await upsertGoogleUser(profile);
    const session = await createAppSession(userId);

    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.append("Set-Cookie", clearStateCookie());
    response.headers.append("Set-Cookie", buildSessionCookie(session.jwt));
    return response;
  } catch (error) {
    console.error("google callback error", error);
    return NextResponse.redirect(new URL("/login?error=google_callback", request.url));
  }
}
