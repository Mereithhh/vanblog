/**
 * Relative time ("N秒前") from UTC instants so visitor TZ vs site TZ
 * cannot render a negative duration for a past event (#369).
 */

const NAIVE_DATE_TIME =
  /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)$/;

function withSeconds(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

export function parseInstantMs(value: unknown): number {
  if (value == null || value === "") {
    return Number.NaN;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  const raw = String(value).trim();
  if (!raw) {
    return Number.NaN;
  }
  const naive = raw.match(NAIVE_DATE_TIME);
  if (naive) {
    return Date.parse(`${naive[1]}T${withSeconds(naive[2])}Z`);
  }
  return Date.parse(raw);
}

export function secondsAgo(value: unknown, now: number = Date.now()): number {
  const then = parseInstantMs(value);
  if (Number.isNaN(then)) {
    return Number.NaN;
  }
  return Math.max(0, Math.floor((now - then) / 1000));
}

export function daysAgo(value: unknown, now: number = Date.now()): number {
  const then = parseInstantMs(value);
  if (Number.isNaN(then)) {
    return 0;
  }
  return Math.max(0, Math.floor((now - then) / 86400000));
}

export function formatTimeAgo(
  value: unknown,
  now: number = Date.now(),
): string {
  if (value == null || value === "") {
    return "-";
  }
  const seconds = secondsAgo(value, now);
  if (Number.isNaN(seconds)) {
    return "-";
  }
  if (seconds <= 0) {
    return "刚刚";
  }
  if (seconds < 60) {
    return `${seconds}秒前`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟前`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}小时前`;
  }
  return `${Math.floor(seconds / 86400)}天前`;
}
