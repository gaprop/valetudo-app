const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const ddMmYyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

export function formatDdMmYyyyDate(isoDate: string): string {
  const match = isoDatePattern.exec(isoDate);
  if (!match) {
    return isoDate;
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function parseDdMmYyyyDate(ddMmYyyyDate: string): string | null {
  const match = ddMmYyyyPattern.exec(ddMmYyyyDate.trim());
  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${yearValue}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function toApiDate(date: string): string {
  return parseDdMmYyyyDate(date) ?? date;
}
