/**
 * Lenient parse for the admin Waline extra-config textarea.
 * Tries strict JSON first so https:// URLs stay intact, then strips
 * // / /* comments and trailing commas (issue #139 example).
 */
export function parseWalineOtherConfigJson(raw: string): Record<string, unknown> {
  const text = String(raw ?? '').trim();
  if (!text) {
    return {};
  }
  const candidates = [text, stripJsonCommentsAndTrailingCommas(text)];
  let lastError: Error | undefined;
  for (const candidate of candidates) {
    try {
      const data = JSON.parse(candidate);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Waline extra config must be a JSON object');
      }
      return data;
    } catch (err) {
      lastError = err as Error;
    }
  }
  throw lastError || new Error('Invalid JSON');
}

export function stripJsonCommentsAndTrailingCommas(input: string): string {
  let result = '';
  let i = 0;
  const n = input.length;
  while (i < n) {
    const ch = input[i];
    if (ch === '"') {
      result += ch;
      i += 1;
      while (i < n) {
        const cur = input[i];
        result += cur;
        if (cur === '\\') {
          i += 1;
          if (i < n) {
            result += input[i];
          }
        } else if (cur === '"') {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (ch === '/' && input[i + 1] === '/') {
      i += 2;
      while (i < n && input[i] !== '\n') {
        i += 1;
      }
      continue;
    }
    if (ch === '/' && input[i + 1] === '*') {
      i += 2;
      while (i + 1 < n && !(input[i] === '*' && input[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }
    result += ch;
    i += 1;
  }
  return result.replace(/,\s*(?=[}\]])/g, '');
}
