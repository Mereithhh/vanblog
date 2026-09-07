import {
  DEFAULT_ARTICLES_PER_PAGE,
  MAX_ARTICLES_PER_PAGE,
  MIN_ARTICLES_PER_PAGE,
  sanitizeArticlesPerPage,
} from './articlesPerPage';

describe('sanitizeArticlesPerPage (#346)', () => {
  it('defaults to the previous hardcoded page size of 5', () => {
    expect(DEFAULT_ARTICLES_PER_PAGE).toBe(5);
    expect(sanitizeArticlesPerPage(undefined)).toBe(5);
    expect(sanitizeArticlesPerPage(null)).toBe(5);
    expect(sanitizeArticlesPerPage('')).toBe(5);
    expect(sanitizeArticlesPerPage('page')).toBe(5);
    expect(sanitizeArticlesPerPage(NaN)).toBe(5);
    expect(sanitizeArticlesPerPage(Infinity)).toBe(5);
  });

  it('keeps a valid configured size', () => {
    expect(sanitizeArticlesPerPage(1)).toBe(1);
    expect(sanitizeArticlesPerPage(10)).toBe(10);
    expect(sanitizeArticlesPerPage('20')).toBe(20);
    expect(sanitizeArticlesPerPage(50)).toBe(50);
  });

  it('clamps below the minimum and above the maximum', () => {
    expect(MIN_ARTICLES_PER_PAGE).toBe(1);
    expect(MAX_ARTICLES_PER_PAGE).toBe(50);
    expect(sanitizeArticlesPerPage(0)).toBe(MIN_ARTICLES_PER_PAGE);
    expect(sanitizeArticlesPerPage(-3)).toBe(MIN_ARTICLES_PER_PAGE);
    expect(sanitizeArticlesPerPage(9999)).toBe(MAX_ARTICLES_PER_PAGE);
    expect(sanitizeArticlesPerPage('100')).toBe(MAX_ARTICLES_PER_PAGE);
  });
});
