import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session.user
  });
}
