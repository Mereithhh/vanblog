import { timingSafeEqual } from 'crypto';
import { BadRequestException } from '@nestjs/common';

/**
 * Access checks for public article reads.
 * A private article or a private category is locked until a non-empty
 * effective password matches. Hidden articles follow allowOpenHiddenPostByUrl.
 */

export function hasArticlePassword(password: unknown): boolean {
  return String(password ?? '').trim().length > 0;
}

export function isPrivateFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

/** Same rule as the public GET article path. */
export function hiddenArticleBlocked(allowOpenHiddenPostByUrl: unknown): boolean {
  return !allowOpenHiddenPostByUrl || allowOpenHiddenPostByUrl == 'false';
}

export function isArticleProtected(
  article: { private?: unknown } | null | undefined,
  category?: { private?: unknown } | null,
): boolean {
  return isPrivateFlag(article?.private) || isPrivateFlag(category?.private);
}

/**
 * Category password wins when the category is private and a password is set.
 * An empty category password falls through to the article password.
 */
export function effectiveArticlePassword(
  article: { password?: unknown } | null | undefined,
  category?: { private?: unknown; password?: unknown } | null,
): string {
  if (category && isPrivateFlag(category.private) && hasArticlePassword(category.password)) {
    return String(category.password);
  }
  return String(article?.password ?? '');
}

export function passwordsMatch(stored: string, submitted: unknown): boolean {
  const left = Buffer.from(stored);
  const right = Buffer.from(String(submitted ?? ''));
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export type UnlockDecision = 'missing' | 'hidden' | 'deny' | 'allow';

export function decideArticleUnlock(input: {
  article: { private?: unknown; password?: unknown; hidden?: unknown } | null | undefined;
  category?: { private?: unknown; password?: unknown } | null;
  submittedPassword: unknown;
  allowOpenHiddenPostByUrl?: unknown;
}): UnlockDecision {
  if (input.submittedPassword == null || input.submittedPassword === '') {
    return 'missing';
  }
  if (!input.article) {
    return 'missing';
  }
  if (input.article.hidden && hiddenArticleBlocked(input.allowOpenHiddenPostByUrl)) {
    return 'hidden';
  }
  const stored = effectiveArticlePassword(input.article, input.category);
  if (isArticleProtected(input.article, input.category) && !hasArticlePassword(stored)) {
    return 'deny';
  }
  if (!hasArticlePassword(stored)) {
    return 'allow';
  }
  return passwordsMatch(stored, input.submittedPassword) ? 'allow' : 'deny';
}

export function plainArticle(article: any): any {
  if (!article) {
    return article;
  }
  return { ...(article._doc || article) };
}

/** Drop password always. Drop content when the caller has not unlocked it. */
export function withoutArticleSecrets(article: any, stripContent: boolean): any {
  const plain = plainArticle(article);
  delete plain.password;
  if (stripContent) {
    delete plain.content;
  }
  return plain;
}

export function presentPublicArticle(article: any, category?: { private?: unknown } | null): any {
  const plain = withoutArticleSecrets(article, false);
  if (isArticleProtected(plain, category)) {
    delete plain.content;
    plain.private = true;
  }
  return plain;
}

export function matchesLockedArticleMetadata(
  article: { title?: string; category?: string; tags?: string[] },
  query: string,
): boolean {
  const needle = String(query || '').toLocaleLowerCase();
  if (!needle) {
    return true;
  }
  const title = String(article?.title || '').toLocaleLowerCase();
  const category = String(article?.category || '').toLocaleLowerCase();
  const tags = Array.isArray(article?.tags) ? article.tags : [];
  const tagHit = tags.map((tag) => String(tag).toLocaleLowerCase()).includes(needle);
  return title.includes(needle) || category.includes(needle) || tagHit;
}

/**
 * Reject creating or updating a private article/category with no password.
 * Updates that do not touch `private` or `password` keep the stored row,
 * including legacy private rows that still have an empty password.
 */
export function assertArticleHasPassword(
  dto: { private?: unknown; password?: unknown } | null | undefined,
  existing?: { private?: unknown; password?: unknown } | null,
) {
  if (!dto) {
    return;
  }
  const touchesPrivacy = dto.private !== undefined || dto.password !== undefined;
  if (!touchesPrivacy) {
    return;
  }
  const nextPrivate = dto.private !== undefined ? dto.private : existing?.private;
  const nextPassword = dto.password !== undefined ? dto.password : existing?.password;
  if (isPrivateFlag(nextPrivate) && !hasArticlePassword(nextPassword)) {
    throw new BadRequestException('如若加密，请填写密码！');
  }
}
