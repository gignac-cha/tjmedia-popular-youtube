export function buildTodayDateRange(): {
  searchStartDate: string;
  searchEndDate: string;
} {
  const today = new Date().toISOString().slice(0, 10);

  return { searchStartDate: today, searchEndDate: today };
}

export function buildThisMonthDateRange(): {
  searchStartDate: string;
  searchEndDate: string;
} {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    searchStartDate: startDate.toISOString().slice(0, 10),
    searchEndDate: now.toISOString().slice(0, 10),
  };
}
