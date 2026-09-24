const TIMEZONE = "Europe/Warsaw";

export function warsawDateKey(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function warsawMonthKey(date) {
  const key = warsawDateKey(date);
  return key.substring(0, 7); // YYYY-MM
}

export function formatWarsawDate(dateString) {
  if (!dateString) return "—";
  try {
    // Use midday UTC to prevent timezone shifts when parsing YYYY-MM-DD
    const date = new Date(`${dateString}T12:00:00Z`);
    if (isNaN(date.getTime())) return "—";
    
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIMEZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatter.format(date);
  } catch (e) {
    return "—";
  }
}

export function formatWarsawDateTime(isoString) {
  const date = new Date(isoString);
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

export function getCurrentWarsawMonthKey() {
  return warsawMonthKey(new Date());
}

export function normalizeStatus(s) {
  return typeof s === "object" && s?.Value ? s.Value : s;
}
