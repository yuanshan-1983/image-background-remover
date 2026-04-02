import { v4 as uuidv4 } from "uuid";
import { getD1Binding, type D1DatabaseLike } from "@/lib/cloudflare-env";

function nowIso() {
  return new Date().toISOString();
}

export async function logUsage(input: {
  userId: string;
  actionType: string;
  inputFilename?: string | null;
  inputMimeType?: string | null;
  inputSizeBytes?: number | null;
  status: "success" | "failed";
  errorMessage?: string | null;
}) {
  const db = getD1Binding();

  if (!db) return;

  await db
    .prepare(
      `INSERT INTO usage_logs (
        id, user_id, action_type, input_filename, input_mime_type, input_size_bytes,
        status, error_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      uuidv4(),
      input.userId,
      input.actionType,
      input.inputFilename ?? null,
      input.inputMimeType ?? null,
      input.inputSizeBytes ?? null,
      input.status,
      input.errorMessage ?? null,
      nowIso()
    )
    .run();
}

export async function getUserUsageCountForDate(userId: string, usageDate: string) {
  const db = getD1Binding();
  if (!db) return 0;

  const row = await db
    .prepare(
      `SELECT remove_background_count FROM usage_daily WHERE user_id = ? AND usage_date = ? LIMIT 1`
    )
    .bind(userId, usageDate)
    .first<{ remove_background_count: number }>();

  return row?.remove_background_count ?? 0;
}

export async function incrementDailyUsage(userId: string, usageDate: string) {
  const db = getD1Binding();
  if (!db) return;

  const existing = await db
    .prepare(`SELECT id, remove_background_count FROM usage_daily WHERE user_id = ? AND usage_date = ? LIMIT 1`)
    .bind(userId, usageDate)
    .first<{ id: string; remove_background_count: number }>();

  if (!existing) {
    await db
      .prepare(
        `INSERT INTO usage_daily (
          id, user_id, usage_date, remove_background_count, created_at, updated_at
        ) VALUES (?, ?, ?, 1, ?, ?)`
      )
      .bind(uuidv4(), userId, usageDate, nowIso(), nowIso())
      .run();
    return;
  }

  await db
    .prepare(
      `UPDATE usage_daily
       SET remove_background_count = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(existing.remove_background_count + 1, nowIso(), existing.id)
    .run();
}
