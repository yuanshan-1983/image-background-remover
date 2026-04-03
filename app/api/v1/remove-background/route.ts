import { NextRequest, NextResponse } from "next/server";
import { getD1Binding, getEnvValue } from "@/lib/cloudflare-env";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { logUsage } from "@/lib/auth/usage";

export const runtime = "nodejs";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  globalThis.__OPENCLAW_CF_CTX__ = await getCloudflareContext({ async: true });

  // Auth via Bearer token
  const authHeader = request.headers.get("authorization") || "";
  const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key. Use Authorization: Bearer <key>" }, { status: 401 });
  }

  const db = getD1Binding();
  if (!db) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  const keyHash = await hashKey(apiKey);
  const keyRow = await db
    .prepare(`SELECT id, user_id, credits_remaining FROM api_keys WHERE key_hash = ? LIMIT 1`)
    .bind(keyHash)
    .first<{ id: string; user_id: string; credits_remaining: number }>();

  if (!keyRow) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (keyRow.credits_remaining <= 0) {
    return NextResponse.json({ error: "No credits remaining. Please top up." }, { status: 403 });
  }

  const removeBgKey = getEnvValue("REMOVE_BG_API_KEY");
  if (!removeBgKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const imageFile = formData.get("image_file");

  if (!(imageFile instanceof File)) {
    return NextResponse.json({ error: "No image_file in form data" }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(imageFile.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (imageFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: `File too large. Max ${MAX_FILE_SIZE_MB}MB` }, { status: 400 });
  }

  // Process
  const removeBgForm = new FormData();
  removeBgForm.append("image_file", imageFile, imageFile.name);
  removeBgForm.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": removeBgKey },
    body: removeBgForm,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    await logUsage({
      userId: keyRow.user_id,
      actionType: "api_remove_background",
      inputFilename: imageFile.name,
      inputMimeType: imageFile.type,
      inputSizeBytes: imageFile.size,
      status: "failed",
      errorMessage: errorText,
    });
    return NextResponse.json({ error: "Background removal failed" }, { status: 502 });
  }

  const arrayBuffer = await response.arrayBuffer();

  // Deduct credit
  await db
    .prepare(`UPDATE api_keys SET credits_remaining = credits_remaining - 1, last_used_at = ? WHERE id = ?`)
    .bind(new Date().toISOString(), keyRow.id)
    .run();

  await logUsage({
    userId: keyRow.user_id,
    actionType: "api_remove_background",
    inputFilename: imageFile.name,
    inputMimeType: imageFile.type,
    inputSizeBytes: imageFile.size,
    status: "success",
  });

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'inline; filename="removed-background.png"',
      "X-Credits-Remaining": String(keyRow.credits_remaining - 1),
    },
  });
}
