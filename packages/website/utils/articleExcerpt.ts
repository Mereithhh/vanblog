/**
 * Homepage / list cards render markdown before「阅读全文」.
 *
 * With `<!-- more -->`, everything before the marker is the excerpt (unchanged).
 * Without it, the card used to take `content.substring(0, 50)`. That cut could
 * land inside `[text](url)` (issue #410): the Viewer then showed raw brackets
 * plus a truncated autolink instead of the complete href and link text.
 *
 * Keep the 50-character budget, but if the cut splits an inline link or image,
 * include the rest of that construct so parse and href stay complete.
 */
export const DEFAULT_OVERVIEW_CHARS = 50;

export function articleOverviewMarkdown(
  content: string,
  maxChars: number = DEFAULT_OVERVIEW_CHARS
): string {
  if (!content) {
    return content;
  }
  if (content.includes("<!-- more -->")) {
    return content.split("<!-- more -->")[0];
  }
  if (content.length <= maxChars) {
    return content;
  }
  return completeTruncatedInlineLinks(content, maxChars);
}

function completeTruncatedInlineLinks(source: string, maxChars: number): string {
  let end = maxChars;
  for (const range of inlineLinkRanges(source)) {
    if (range.start < maxChars && range.end > maxChars) {
      end = Math.max(end, range.end);
    }
  }
  return source.slice(0, end);
}

function inlineLinkRanges(source: string): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  let i = 0;
  while (i < source.length) {
    const start = findLinkOpen(source, i);
    if (start === -1) {
      break;
    }
    const textClose = findMatchingRBracket(source, start);
    if (textClose === -1 || source[textClose + 1] !== "(") {
      i = start + 1;
      continue;
    }
    const destClose = findLinkCloseParen(source, textClose + 2);
    if (destClose === -1) {
      i = start + 1;
      continue;
    }
    ranges.push({ start, end: destClose + 1 });
    i = destClose + 1;
  }
  return ranges;
}

function findLinkOpen(source: string, from: number): number {
  for (let i = from; i < source.length; i++) {
    const c = source[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "`") {
      const close = source.indexOf("`", i + 1);
      if (close === -1) {
        return -1;
      }
      i = close;
      continue;
    }
    if (c === "[") {
      return i;
    }
    if (c === "!" && source[i + 1] === "[") {
      return i;
    }
  }
  return -1;
}

function findMatchingRBracket(source: string, openIdx: number): number {
  const bracketStart = source[openIdx] === "!" ? openIdx + 1 : openIdx;
  let depth = 0;
  for (let i = bracketStart; i < source.length; i++) {
    const c = source[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "`") {
      const close = source.indexOf("`", i + 1);
      if (close === -1) {
        return -1;
      }
      i = close;
      continue;
    }
    if (c === "[") {
      depth++;
    } else if (c === "]") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function findLinkCloseParen(source: string, destStart: number): number {
  let i = skipSpace(source, destStart);
  if (i >= source.length) {
    return -1;
  }

  if (source[i] === "<") {
    const gt = indexOfUnescaped(source, ">", i + 1);
    if (gt === -1) {
      return -1;
    }
    i = gt + 1;
  } else {
    const destEnd = scanUnquotedDestination(source, i);
    if (destEnd === -1) {
      return -1;
    }
    if (source[destEnd] === ")" && destEnd === skipSpace(source, destEnd)) {
      return destEnd;
    }
    i = destEnd;
  }

  i = skipSpace(source, i);
  if (source[i] === '"' || source[i] === "'") {
    const q = source[i];
    const close = indexOfUnescaped(source, q, i + 1);
    if (close === -1) {
      return -1;
    }
    i = skipSpace(source, close + 1);
  } else if (source[i] === "(") {
    const close = indexOfUnescaped(source, ")", i + 1);
    if (close === -1) {
      return -1;
    }
    i = skipSpace(source, close + 1);
  }
  return source[i] === ")" ? i : -1;
}

function scanUnquotedDestination(source: string, start: number): number {
  let depth = 0;
  let i = start;
  if (i >= source.length) {
    return -1;
  }
  for (; i < source.length; i++) {
    const c = source[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === " " || c === "\t" || c === "\n") {
      break;
    }
    if (c === "(") {
      depth++;
    } else if (c === ")") {
      if (depth === 0) {
        return i;
      }
      depth--;
    }
  }
  return i === start ? -1 : i;
}

function skipSpace(source: string, i: number): number {
  while (i < source.length && (source[i] === " " || source[i] === "\t" || source[i] === "\n")) {
    i++;
  }
  return i;
}

function indexOfUnescaped(source: string, ch: string, from: number): number {
  for (let i = from; i < source.length; i++) {
    if (source[i] === "\\") {
      i++;
      continue;
    }
    if (source[i] === ch) {
      return i;
    }
  }
  return -1;
}
