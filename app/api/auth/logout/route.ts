import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/custom-oauth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.headers.append("Set-Cookie", clearSessionCookie());
  return response;
}
