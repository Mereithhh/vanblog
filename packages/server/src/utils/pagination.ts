/**
 * Query-string page/pageSize can become NaN, Infinity, or overflow after a
 * proxy/CDN mangles them. Mongo skip is an int64 and rejects negatives;
 * NaN is serialized as Int64.MIN (−9223372036854775808).
 *
 * pageSize −1 keeps the existing “return all rows” meaning used by public
 * category/tag pages.
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 5;
export const MAX_PAGE_SIZE = 100;
export const UNLIMITED_PAGE_SIZE = -1;

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
};

export type SanitizePaginationOptions = {
  defaultPage?: number;
  defaultPageSize?: number;
  maxPageSize?: number;
  /** Keep pageSize −1 as “return all” (public category/tag lists). */
  allowUnlimited?: boolean;
};

export function coerceFiniteInt(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return null;
    }
    return Math.trunc(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
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

export function sanitizePagination(
  page: unknown,
  pageSize: unknown,
  options: SanitizePaginationOptions = {},
): Pagination {
  const defaultPage = options.defaultPage ?? DEFAULT_PAGE;
  const defaultPageSize = options.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const maxPageSize = options.maxPageSize ?? MAX_PAGE_SIZE;

  const rawPageSize = coerceFiniteInt(pageSize);
  let safePageSize: number;
  if (options.allowUnlimited && rawPageSize === UNLIMITED_PAGE_SIZE) {
    safePageSize = UNLIMITED_PAGE_SIZE;
  } else if (rawPageSize === null || rawPageSize < 1) {
    safePageSize = defaultPageSize;
  } else {
    safePageSize = Math.min(rawPageSize, maxPageSize);
  }

  const rawPage = coerceFiniteInt(page);
  let safePage = rawPage === null || rawPage < 1 ? defaultPage : rawPage;

  let skip = 0;
  if (safePageSize !== UNLIMITED_PAGE_SIZE) {
    const maxPage = Math.floor(Number.MAX_SAFE_INTEGER / safePageSize) + 1;
    if (safePage > maxPage) {
      safePage = maxPage;
    }
    skip = (safePage - 1) * safePageSize;
    if (!Number.isFinite(skip) || skip < 0) {
      skip = 0;
      safePage = defaultPage;
    }
  }

  return { page: safePage, pageSize: safePageSize, skip };
}
