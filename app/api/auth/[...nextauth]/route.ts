import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      message: "NextAuth has been replaced by the custom Google OAuth flow. Use /api/auth/google/start instead."
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "NextAuth has been replaced by the custom Google OAuth flow."
    },
    { status: 410 }
  );
}
