export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Deterministic number-driven money formatter (no Date involved). */
export function formatMoney(value: number, currency = "$"): string {
  const abs = Math.abs(value);
  const compact = (n: number, digits: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  if (abs >= 1_000_000) {
    const v = value / 1_000_000;
    return `${currency}${compact(parseFloat(v.toFixed(1)), 1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    const digits = abs >= 100_000 ? 0 : 1;
    const v = value / 1_000;
    return `${currency}${compact(parseFloat(v.toFixed(digits)), digits).replace(/\.0$/, "")}K`;
  }
  return `${currency}${Math.round(value).toLocaleString("en-US")}`;
}

/** deterministic relative label from raw minutes */
export function relMins(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** deterministic label from "days ago" */
export function relAgoDays(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

/** deterministic label for "days from now" */
export function relInDays(days: number): string {
  if (days <= 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days}d`;
}

/** deterministic tenure label from "days ago" */
export function tenureLabel(days: number): string {
  if (days <= 0) return "joined today";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}m`;
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}