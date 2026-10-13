// Pure helpers, safe on the client. Events are stored as UTC instants and
// entered/shown in the browser's time zone, so conversion happens here.

export const DEFAULT_TIME = "09:00";

const pad = (n: number) => String(n).padStart(2, "0");

/** Browser-local "yyyy-mm-dd" and "HH:mm" of an ISO instant. */
export function toLocalParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/**
 * Browser-local date and time inputs to a UTC ISO instant. Returns "" when
 * either is missing or invalid, which the server reports as a date error.
 */
export function fromLocalParts(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return "";
  }
  const instant = new Date(`${date}T${time}`);
  return Number.isNaN(instant.getTime()) ? "" : instant.toISOString();
}

/** Date (and, for a time-grid slot, time) of a FullCalendar `dateStr`. */
export function clickedDateParts(dateStr: string): {
  date: string;
  time?: string;
} {
  const date = dateStr.slice(0, 10);
  return dateStr.length > 10 ? { date, time: dateStr.slice(11, 16) } : { date };
}
