/** Same default as the previous hardcoded front-list page size. */
export const DEFAULT_ARTICLES_PER_PAGE = 5;
export const MIN_ARTICLES_PER_PAGE = 1;
export const MAX_ARTICLES_PER_PAGE = 50;

function coerceFiniteInt(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return Math.trunc(parsed);
  }
  return null;
}

/**
 * Front article-list page size from public meta / site settings.
 * Missing/invalid → 5; clamp to 1..50.
 */
export function sanitizeArticlesPerPage(value: unknown): number {
  const raw = coerceFiniteInt(value);
  if (raw === null) {
    return DEFAULT_ARTICLES_PER_PAGE;
  }
  if (raw < MIN_ARTICLES_PER_PAGE) {
    return MIN_ARTICLES_PER_PAGE;
  }
  if (raw > MAX_ARTICLES_PER_PAGE) {
    return MAX_ARTICLES_PER_PAGE;
  }
  return raw;
}
