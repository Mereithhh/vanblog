/** Shown for article view / comment counts until the real number has loaded. */
export const COUNT_LOADING_PLACEHOLDER = "...";

export const ARTICLE_VIEWER_ATTR = "data-article-viewer";

export function formatCountDisplay(count: number | null): string {
  if (count === null) {
    return COUNT_LOADING_PLACEHOLDER;
  }
  return String(count);
}

export function resolveArticleViewer(
  res: { viewer?: number } | null | undefined,
  options: { shouldAddViewer: boolean; noViewer: boolean }
): number {
  if (typeof res?.viewer === "number") {
    if (options.noViewer) {
      return res.viewer;
    }
    return options.shouldAddViewer ? res.viewer + 1 : res.viewer;
  }
  if (options.noViewer) {
    return 0;
  }
  if (!res) {
    return options.shouldAddViewer ? 1 : 0;
  }
  // Payload present but no numeric viewer (e.g. {} on a failed build-time fetch).
  return 0;
}
