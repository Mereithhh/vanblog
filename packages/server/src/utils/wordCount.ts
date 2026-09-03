/**
 * CJK-aware word count used by site 总字数.
 *
 * Must match ByteMD's editor status bar (`word-count`): each CJK character
 * counts as 1, each Latin/numeric token counts as 1. Markdown punctuation,
 * spaces, and UTF-8 byte length are not counted.
 */
const WORD_COUNT_PATTERN =
  /[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;

export function wordCount(input: string | null | undefined): number {
  const data = input ?? '';
  if (!data) {
    return 0;
  }
  const matches = data.match(WORD_COUNT_PATTERN);
  if (!matches) {
    return 0;
  }
  let count = 0;
  for (const token of matches) {
    if (token.charCodeAt(0) >= 0x4e00) {
      count += token.length;
    } else {
      count += 1;
    }
  }
  return count;
}
