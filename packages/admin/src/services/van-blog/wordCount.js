/**
 * CJK-aware word count. Same metric as the ByteMD editor status bar
 * (`word-count`) and the server-side site 总字数.
 */
export function wordCount(input) {
  const data = input ?? '';
  if (!data) {
    return 0;
  }
  const pattern =
    /[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
  const matches = data.match(pattern);
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
