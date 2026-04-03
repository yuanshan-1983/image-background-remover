import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getD1Binding } from "@/lib/cloudflare-env";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// List API keys
export async function GET() {
  const session = await requireSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getD1Binding();
  if (!db) return NextResponse.json({ keys: [] });

  const keys = await db
    .prepare(`SELECT id, name, credits_remaining, created_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`)
    .bind(session.user.id)
    .all<{ id: string; name: string; credits_remaining: number; created_at: string; last_used_at: string | null }>();

  return NextResponse.json({ keys: keys.results ?? [] });
}

// Create new API key
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getD1Binding();
  if (!db) return NextResponse.json({ error: "DB not available" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const name = body.name || "Default";

  // Generate a random API key
  const rawKey = `ibgr_${uuidv4().replace(/-/g, "")}`;
  const keyHash = await hashKey(rawKey);
  const id = uuidv4();

  await db
    .prepare(`INSERT INTO api_keys (id, user_id, key_hash, name, credits_remaining, created_at) VALUES (?, ?, ?, ?, 100, ?)`)
    .bind(id, session.user.id, keyHash, name, new Date().toISOString())
    .run();

  // Return the raw key only once
  return NextResponse.json({
    id,
    key: rawKey,
    name,
    credits: 100,
    message: "Save this key — it won't be shown again.",
  });
}
