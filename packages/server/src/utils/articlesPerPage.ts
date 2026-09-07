import { coerceFiniteInt } from './pagination';

/** Same default as the previous hardcoded front-list page size. */
export const DEFAULT_ARTICLES_PER_PAGE = 5;
export const MIN_ARTICLES_PER_PAGE = 1;
export const MAX_ARTICLES_PER_PAGE = 50;

/**
 * Front article-list page size from site settings.
 * Missing/invalid values keep today's default (5). Out-of-range numbers
 * are clamped so a huge setting cannot DoS list/ISR generation.
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
