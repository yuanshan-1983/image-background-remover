const FREE_DAILY_REMOVE_BG_LIMIT = 5;
const PRO_DAILY_REMOVE_BG_LIMIT = 100;

/** Emails with unlimited usage (no daily cap) */
const UNLIMITED_EMAILS = new Set([
  "syamsulbahri52@madrasah.kemenag.go.id",
]);

export function getTodayUsageDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getFreeDailyRemoveBgLimit() {
  return FREE_DAILY_REMOVE_BG_LIMIT;
}

export function getProDailyRemoveBgLimit() {
  return PRO_DAILY_REMOVE_BG_LIMIT;
}

export function getDailyLimitForPlan(plan: string | null | undefined): number {
  if (plan === "pro") return PRO_DAILY_REMOVE_BG_LIMIT;
  return FREE_DAILY_REMOVE_BG_LIMIT;
}

export function isUnlimitedUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return UNLIMITED_EMAILS.has(email.toLowerCase());
}
