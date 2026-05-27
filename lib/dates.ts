const dateTime = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthAbbr = new Intl.DateTimeFormat("en-US", { month: "short" });

export function formatEventDateTime(d: Date) {
  return dateTime.format(d);
}

export function formatShortDate(d: Date) {
  return dateOnly.format(d);
}

export function dayNum(d: Date) {
  return d.getDate();
}

export function monthAbbreviation(d: Date) {
  return monthAbbr.format(d);
}
