import { normalizeHeadingText } from "./headingText";

/** Encode heading text for a URL fragment. Ids stay as the raw heading text. */
export function encodeHeadingHash(text: string | null | undefined): string {
  return encodeURIComponent(normalizeHeadingText(text));
}

/** Decode a location.hash / href fragment back to heading text. */
export function decodeHeadingHash(raw: string | null | undefined): string {
  const stripped = String(raw ?? "").replace(/^#/, "");
  if (!stripped) return "";
  let current = stripped;
  // Browsers / clients may deliver an already-decoded or double-encoded hash.
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return normalizeHeadingText(current);
}

/** `href` for a heading permalink or TOC item (`#` + encodeURIComponent). */
export function headingHashHref(text: string | null | undefined): string {
  return `#${encodeHeadingHash(text)}`;
}

/**
 * Match a hash (encoded or raw) against `NavItem.text` / `data-id` / `id`.
 * Does not slugify; compares the unparsed heading text.
 */
export function headingHashMatches(
  headingText: string | null | undefined,
  rawHash: string | null | undefined
): boolean {
  const text = normalizeHeadingText(headingText);
  if (!text) return false;
  const stripped = String(rawHash ?? "").replace(/^#/, "");
  if (!stripped) return false;
  const decoded = decodeHeadingHash(stripped);
  return (
    text === decoded ||
    text === stripped ||
    encodeHeadingHash(text) === stripped
  );
}

export function findNavItemByHash<T extends { text: string }>(
  items: T[],
  rawHash: string | null | undefined
): T | undefined {
  return items.find((item) => headingHashMatches(item.text, rawHash));
}
