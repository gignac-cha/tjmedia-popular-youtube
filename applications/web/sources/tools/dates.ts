function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function buildTodayDateRange(): {
  searchStartDate: string;
  searchEndDate: string;
} {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  return {
    searchStartDate: formatLocalDate(yesterday),
    searchEndDate: formatLocalDate(now),
  };
}

export function buildThisMonthDateRange(): {
  searchStartDate: string;
  searchEndDate: string;
} {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    searchStartDate: formatLocalDate(startDate),
    searchEndDate: formatLocalDate(now),
  };
}
