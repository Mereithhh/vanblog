import { isForceLoginCommentEnabled } from './walineLogin';

/**
 * JSON-serializable @waline/client init keys that are safe to expose on
 * /api/public/comment-setting. Server-only env (IPQPS, SMTP_*, AKISMET_KEY,
 * LOGIN, …) stays out of this list so it is not leaked to the public widget.
 */
export const WALINE_CLIENT_OPTION_KEYS = [
  'imageUploader',
  'wordLimit',
  'pageSize',
  'meta',
  'requiredMeta',
  'emoji',
  'lang',
  'locale',
  'dark',
  'search',
  'reaction',
  'copyright',
  'recaptchaV3Key',
  'turnstileKey',
] as const;

export type WalineClientOptionKey = (typeof WALINE_CLIENT_OPTION_KEYS)[number];

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

export function coerceWalineOptionValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed === 'false') {
    return false;
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed !== '' && /^-?\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
  }
  if (trimmed !== '' && /^-?\d+\.\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return value;
}

function coerceWalineOptionBag(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = coerceWalineOptionValue(value);
  }
  return result;
}

/**
 * Parses the admin "自定义环境变量" JSON bag.
 * Accepts line/block comments plus trailing commas so the example from
 * https://github.com/Mereithhh/vanblog/issues/139 can be saved as-is.
 */
export function parseWalineOtherConfig(raw?: string | null): Record<string, unknown> {
  if (raw == null) {
    return {};
  }
  const text = String(raw).trim();
  if (text === '') {
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
      return coerceWalineOptionBag(data as Record<string, unknown>);
    } catch (err) {
      lastError = err as Error;
    }
  }
  throw lastError || new Error('Invalid Waline extra config JSON');
}

export function tryParseWalineOtherConfig(raw?: string | null): Record<string, unknown> {
  try {
    return parseWalineOtherConfig(raw);
  } catch {
    return {};
  }
}

/**
 * Spawn/env values must be strings. `false` must become `"false"`, not be dropped.
 */
export function stringifyWalineEnvValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return undefined;
    }
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return undefined;
    }
  }
  return String(value);
}

export function toWalineProcessEnv(env: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    const asString = stringifyWalineEnvValue(value);
    if (asString === undefined) {
      continue;
    }
    result[key] = asString;
  }
  return result;
}

export function buildWalineEnvFromOtherConfig(raw?: string | null): Record<string, string> {
  return toWalineProcessEnv(tryParseWalineOtherConfig(raw));
}

export function buildWalineClientOptionsFromOtherConfig(
  raw?: string | null,
): Record<string, unknown> {
  const parsed = tryParseWalineOtherConfig(raw);
  const client: Record<string, unknown> = {};
  for (const key of WALINE_CLIENT_OPTION_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(parsed, key)) {
      continue;
    }
    const value = parsed[key];
    if (key === 'imageUploader') {
      if (value === false) {
        client.imageUploader = false;
      }
      continue;
    }
    if (value !== undefined) {
      client[key] = value;
    }
  }
  return client;
}

export function getWalinePublicCommentSetting(waline?: { forceLoginComment?: unknown; otherConfig?: string } | null) {
  return {
    forceLoginComment: isForceLoginCommentEnabled(waline?.forceLoginComment),
    ...buildWalineClientOptionsFromOtherConfig(waline?.otherConfig),
  };
}
