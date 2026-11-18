const TZ = "Africa/Lagos";

const time = new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", timeZone: TZ });
const day = new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });

export const fmtTime = (iso: string) => time.format(new Date(iso));

export function fmtWhen(iso: string) {
  const d = new Date(iso);
  const today = dayKey.format(new Date());
  if (dayKey.format(d) === today) return `Today, ${time.format(d)}`;
  return `${day.format(d)}, ${time.format(d)}`;
}

export function firstName(full: string) {
  return full.trim().split(/\s+/)[0] || "there";
}

export function pointLetter(name: string, index: number) {
  return /\b([A-Za-z0-9])$/.exec(name.trim())?.[1]?.toUpperCase() ?? String(index + 1);
}
