import { NextResponse } from "next/server";
import { getEnvValue } from "@/lib/cloudflare-env";

export async function GET() {
  return NextResponse.json({
    hasAuthSecret: Boolean(getEnvValue("AUTH_SECRET")),
    hasNextAuthSecret: Boolean(getEnvValue("NEXTAUTH_SECRET")),
    hasGoogleId: Boolean(getEnvValue("AUTH_GOOGLE_ID")),
    hasGoogleSecret: Boolean(getEnvValue("AUTH_GOOGLE_SECRET")),
    hasAuthUrl: Boolean(getEnvValue("AUTH_URL")),
    hasNextAuthUrl: Boolean(getEnvValue("NEXTAUTH_URL"))
  });
}
