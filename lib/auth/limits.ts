const FREE_DAILY_REMOVE_BG_LIMIT = 5;

export function getTodayUsageDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getFreeDailyRemoveBgLimit() {
  return FREE_DAILY_REMOVE_BG_LIMIT;
}
