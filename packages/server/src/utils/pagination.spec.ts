import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  UNLIMITED_PAGE_SIZE,
  coerceFiniteInt,
  sanitizePagination,
} from './pagination';

describe('coerceFiniteInt', () => {
  it('accepts finite numbers and numeric strings', () => {
    expect(coerceFiniteInt(3)).toBe(3);
    expect(coerceFiniteInt(3.9)).toBe(3);
    expect(coerceFiniteInt('12')).toBe(12);
    expect(coerceFiniteInt(' 8 ')).toBe(8);
    expect(coerceFiniteInt('-4')).toBe(-4);
  });

  it('rejects missing, NaN, non-finite, and non-numeric values', () => {
    expect(coerceFiniteInt(undefined)).toBeNull();
    expect(coerceFiniteInt(null)).toBeNull();
    expect(coerceFiniteInt(NaN)).toBeNull();
    expect(coerceFiniteInt(Infinity)).toBeNull();
    expect(coerceFiniteInt(-Infinity)).toBeNull();
    expect(coerceFiniteInt('')).toBeNull();
    expect(coerceFiniteInt('   ')).toBeNull();
    expect(coerceFiniteInt('NaN')).toBeNull();
    expect(coerceFiniteInt('undefined')).toBeNull();
    expect(coerceFiniteInt('page')).toBeNull();
    expect(coerceFiniteInt({})).toBeNull();
    expect(coerceFiniteInt([])).toBeNull();
  });
});

describe('sanitizePagination (#400)', () => {
  it('uses defaults when page/pageSize are missing', () => {
    expect(sanitizePagination(undefined, undefined)).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      skip: 0,
    });
    expect(sanitizePagination(undefined, undefined, { defaultPageSize: 10 })).toEqual({
      page: 1,
      pageSize: 10,
      skip: 0,
    });
  });

  it('keeps a normal page offset', () => {
    expect(sanitizePagination(3, 10)).toEqual({ page: 3, pageSize: 10, skip: 20 });
    expect(sanitizePagination('2', '5')).toEqual({ page: 2, pageSize: 5, skip: 5 });
  });

  it('clamps page to ≥ 1 so skip is never negative', () => {
    expect(sanitizePagination(0, 10).skip).toBe(0);
    expect(sanitizePagination(-1, 10)).toEqual({ page: 1, pageSize: 10, skip: 0 });
    expect(sanitizePagination(-9223372036854775808, 5).skip).toBeGreaterThanOrEqual(0);
  });

  it('replaces NaN / non-finite / garbage page with a safe default', () => {
    for (const page of [NaN, Infinity, -Infinity, 'NaN', 'abc', '', null, undefined]) {
      const paging = sanitizePagination(page, 10);
      expect(Number.isFinite(paging.page)).toBe(true);
      expect(paging.page).toBeGreaterThanOrEqual(1);
      expect(paging.skip).toBe(0);
    }
  });

  it('replaces invalid pageSize and clamps oversized pageSize', () => {
    expect(sanitizePagination(1, NaN).pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(sanitizePagination(1, 0).pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(sanitizePagination(1, -5).pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(sanitizePagination(1, Infinity).pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(sanitizePagination(1, 'huge').pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(sanitizePagination(1, 9999).pageSize).toBe(MAX_PAGE_SIZE);
  });

  it('preserves pageSize -1 as unlimited only when allowed', () => {
    expect(sanitizePagination(1, -1, { allowUnlimited: true })).toEqual({
      page: 1,
      pageSize: UNLIMITED_PAGE_SIZE,
      skip: 0,
    });
    expect(sanitizePagination(9, '-1', { allowUnlimited: true }).pageSize).toBe(
      UNLIMITED_PAGE_SIZE,
    );
    expect(sanitizePagination(1, -1).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('caps overflow page so (page-1)*pageSize stays a safe non-negative integer', () => {
    const overflow = sanitizePagination(Number.MAX_VALUE, 10);
    expect(Number.isFinite(overflow.skip)).toBe(true);
    expect(overflow.skip).toBeGreaterThanOrEqual(0);
    expect(overflow.skip).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    expect(Number.isInteger(overflow.skip)).toBe(true);

    const hugeString = sanitizePagination('1e20', 5);
    expect(hugeString.skip).toBeGreaterThanOrEqual(0);
    expect(Number.isSafeInteger(hugeString.skip)).toBe(true);
  });

  it('never returns a negative or non-finite skip', () => {
    const hostile = [
      [undefined, undefined],
      [NaN, NaN],
      [0, 0],
      [-1, -2],
      [Infinity, 10],
      [1, Infinity],
      ['', ''],
      ['page', 'size'],
      [Number.MIN_SAFE_INTEGER, Number.MAX_VALUE],
      ['-9223372036854775808', '10'],
    ] as const;
    for (const [page, pageSize] of hostile) {
      const paging = sanitizePagination(page, pageSize);
      expect(Number.isFinite(paging.skip)).toBe(true);
      expect(paging.skip).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(paging.page)).toBe(true);
      expect(paging.page).toBeGreaterThanOrEqual(1);
    }
  });
});
