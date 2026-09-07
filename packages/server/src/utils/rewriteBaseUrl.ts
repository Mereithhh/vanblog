import { BadRequestException } from '@nestjs/common';

export type RewriteBaseUrlTextResult = {
  text: string;
  replacements: number;
};

export type RewriteBaseUrlCount = {
  updated: number;
  replacements: number;
};

export function normalizeBaseUrl(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(/\/+$/, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace an old site/static base URL with a new one inside stored markdown/HTML.
 * Trailing slashes on either side are ignored. A match is only counted when the
 * old base is a real URL prefix (end of string, or followed by `/ ? # " ' ) ]`
 * or whitespace) so `https://old.com.evil.com` is left alone.
 */
export function rewriteBaseUrlInText(
  text: string,
  oldBase: string,
  newBase: string,
): RewriteBaseUrlTextResult {
  const source = text ?? '';
  const oldNorm = normalizeBaseUrl(oldBase);
  const newNorm = normalizeBaseUrl(newBase);
  if (!source || !oldNorm || !newNorm || oldNorm === newNorm) {
    return { text: source, replacements: 0 };
  }

  const pattern = new RegExp(`${escapeRegExp(oldNorm)}(?=[/?#"')\\]\\s]|$)`, 'g');
  let replacements = 0;
  const next = source.replace(pattern, () => {
    replacements += 1;
    return newNorm;
  });
  return { text: next, replacements };
}

export function assertHttpBaseUrl(raw: string, label: string): void {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new BadRequestException(`${label}请填写包含协议的完整 URL，例如 https://example.com`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException(`${label}只支持 http 或 https 地址`);
  }
  if (!parsed.hostname) {
    throw new BadRequestException(`${label}缺少主机名`);
  }
}

/**
 * Returns normalized bases, or null when the rewrite should be a no-op
 * (missing old/new, or they are the same after stripping trailing slashes).
 * Throws when a non-empty value is not an http(s) URL.
 */
export function prepareRewriteBases(
  oldBase: unknown,
  newBase: unknown,
): { oldBase: string; newBase: string } | null {
  const oldNorm = normalizeBaseUrl(oldBase);
  const newNorm = normalizeBaseUrl(newBase);
  if (!oldNorm || !newNorm || oldNorm === newNorm) {
    return null;
  }
  assertHttpBaseUrl(oldNorm, '旧地址');
  assertHttpBaseUrl(newNorm, '新地址');
  return { oldBase: oldNorm, newBase: newNorm };
}

export async function rewriteBaseUrlInDocuments(
  docs: Array<{ id: number; content?: string }>,
  updateContent: (id: number, content: string) => Promise<unknown>,
  oldBase: string,
  newBase: string,
): Promise<RewriteBaseUrlCount> {
  let updated = 0;
  let replacements = 0;
  for (const doc of docs) {
    const result = rewriteBaseUrlInText(doc.content || '', oldBase, newBase);
    if (result.replacements === 0) {
      continue;
    }
    await updateContent(doc.id, result.text);
    updated += 1;
    replacements += result.replacements;
  }
  return { updated, replacements };
}
