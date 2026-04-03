import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getUserUsageCountForDate } from "@/lib/auth/usage";
import { getFreeDailyRemoveBgLimit, getTodayUsageDate, isUnlimitedUser } from "@/lib/auth/limits";
import { getD1Binding } from "@/lib/cloudflare-env";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const email = (session.user as any).email as string | undefined;
  const usageDate = getTodayUsageDate();
  const todayCount = await getUserUsageCountForDate(userId, usageDate);
  const unlimited = isUnlimitedUser(email);
  const dailyLimit = unlimited ? null : getFreeDailyRemoveBgLimit();

  // Total usage all time
  const db = getD1Binding();
  let totalCount = 0;
  let recentLogs: { filename: string; status: string; created_at: string }[] = [];
  let memberSince: string | null = null;

  if (db) {
    const totalRow = await db
      .prepare(`SELECT COUNT(*) as cnt FROM usage_logs WHERE user_id = ? AND action_type = 'remove_background'`)
      .bind(userId)
      .first<{ cnt: number }>();
    totalCount = totalRow?.cnt ?? 0;

    const logs = await db
      .prepare(
        `SELECT input_filename as filename, status, created_at FROM usage_logs
         WHERE user_id = ? AND action_type = 'remove_background'
         ORDER BY created_at DESC LIMIT 20`
      )
      .bind(userId)
      .all<{ filename: string; status: string; created_at: string }>();
    recentLogs = logs.results ?? [];

    const userRow = await db
      .prepare(`SELECT created_at FROM users WHERE id = ? LIMIT 1`)
      .bind(userId)
      .first<{ created_at: string }>();
    memberSince = userRow?.created_at ?? null;
  }

  return NextResponse.json({
    today: todayCount,
    dailyLimit,
    unlimited,
    totalCount,
    memberSince,
    recentLogs,
  });
}
