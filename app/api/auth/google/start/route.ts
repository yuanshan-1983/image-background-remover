import { NextResponse } from "next/server";
import { buildStateCookie, generateState, getGoogleAuthUrl } from "@/lib/auth/custom-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = generateState();
  const url = getGoogleAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.headers.append("Set-Cookie", buildStateCookie(state));
  return response;
}
