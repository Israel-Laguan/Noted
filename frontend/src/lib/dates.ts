const monthDayFormatter = new Intl.DateTimeFormat("en", { month: "long", day: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });

function calendarDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

export function formatNoteDate(value: string | Date, now = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  const difference = calendarDayNumber(now) - calendarDayNumber(date);
  if (difference === 0) return "today";
  if (difference === 1) return "yesterday";
  return monthDayFormatter.format(date);
}

export function formatLastEdited(value: string | Date, now = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  return `Last edited ${formatNoteDate(date, now)} at ${timeFormatter.format(date)}`;
}
