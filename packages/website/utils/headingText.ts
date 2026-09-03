/** Shared heading-anchor text so TOC links and heading `id`/`data-id` stay in sync. */
export function normalizeHeadingText(text: string | null | undefined): string {
  return String(text ?? "").trim();
}
