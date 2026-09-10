export function normalizeArticleCover(cover?: string | null): string | undefined {
  if (typeof cover !== "string") return undefined;
  const trimmed = cover.trim();
  return trimmed ? trimmed : undefined;
}

export function resolveArticleCoverUrl(
  cover?: string | null,
  baseUrl?: string | null
): string | undefined {
  const src = normalizeArticleCover(cover);
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) {
    return src;
  }
  const base = typeof baseUrl === "string" ? baseUrl.trim() : "";
  if (!base) return src;
  try {
    const normalizedBase = /\/$/.test(base) ? base : `${base}/`;
    return new URL(src, normalizedBase).toString();
  } catch {
    return src;
  }
}

export type ShareImageMeta =
  | { property: string; content: string }
  | { name: string; content: string };

export function articleShareImageMeta(
  cover?: string | null,
  baseUrl?: string | null
): ShareImageMeta[] {
  const url = resolveArticleCoverUrl(cover, baseUrl);
  if (!url) return [];
  return [
    { property: "og:image", content: url },
    { name: "twitter:image", content: url },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}
