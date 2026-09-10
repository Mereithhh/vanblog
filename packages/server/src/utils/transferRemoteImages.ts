export type ImageRef = {
  url: string;
  raw: string;
  index: number;
};

export type ImageUrlKind = 'remote' | 'skip';

export type ClassifyImageUrlResult = {
  kind: ImageUrlKind;
  reason?: string;
};

export type TransferRemoteResult = {
  content: string;
  transferred: Array<{ from: string; to: string }>;
  skipped: Array<{ url: string; reason: string }>;
  failed: Array<{ url: string; reason: string }>;
};

const MARKDOWN_IMAGE =
  /!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const HTML_IMAGE = /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

export function extractImageRefs(content: string): ImageRef[] {
  if (!content) {
    return [];
  }
  const refs: ImageRef[] = [];
  let match: RegExpExecArray | null;
  const markdown = new RegExp(MARKDOWN_IMAGE.source, 'g');
  while ((match = markdown.exec(content)) !== null) {
    refs.push({ url: (match[2] || '').trim(), raw: match[0], index: match.index });
  }
  const html = new RegExp(HTML_IMAGE.source, 'gi');
  while ((match = html.exec(content)) !== null) {
    const url = (match[1] || match[2] || match[3] || '').trim();
    refs.push({ url, raw: match[0], index: match.index });
  }
  return refs.sort((a, b) => a.index - b.index);
}

export function collectSiteHosts(siteBaseUrl?: string, extraHosts?: Array<string | undefined>): string[] {
  const hosts = new Set<string>();
  const add = (raw?: string) => {
    if (!raw || typeof raw !== 'string') {
      return;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
      return;
    }
    try {
      if (/^https?:\/\//i.test(trimmed)) {
        hosts.add(new URL(trimmed).hostname.toLowerCase());
        return;
      }
      const host = trimmed
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '')
        .toLowerCase();
      if (host) {
        hosts.add(host);
      }
    } catch {
      // ignore unparseable values
    }
  };
  add(siteBaseUrl);
  extraHosts?.forEach(add);
  return [...hosts];
}

export function classifyImageUrl(
  url: string,
  opts: { siteHosts?: string[]; knownRealPaths?: string[] } = {},
): ClassifyImageUrlResult {
  const raw = (url || '').trim();
  if (!raw) {
    return { kind: 'skip', reason: 'empty' };
  }
  if (/^data:/i.test(raw)) {
    return { kind: 'skip', reason: 'data-url' };
  }
  if (/^(blob:|javascript:|about:)/i.test(raw)) {
    return { kind: 'skip', reason: 'non-http' };
  }
  if (!/^https?:\/\//i.test(raw)) {
    return { kind: 'skip', reason: 'relative' };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { kind: 'skip', reason: 'invalid' };
  }

  const host = parsed.hostname.toLowerCase();
  const siteHosts = (opts.siteHosts || []).map((h) => h.toLowerCase());
  if (siteHosts.includes(host)) {
    return { kind: 'skip', reason: 'same-origin' };
  }

  const known = (opts.knownRealPaths || []).filter(Boolean);
  if (known.includes(raw) || known.includes(stripUrlExtras(raw))) {
    return { kind: 'skip', reason: 'already-stored' };
  }

  return { kind: 'remote' };
}

export function stripUrlExtras(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('#')[0].split('?')[0];
  }
}

export function filenameFromRemote(url: string, contentType?: string): string {
  let name = 'remote';
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split('/').filter(Boolean).pop() || 'remote';
    name = decodeURIComponent(last);
  } catch {
    const last = url.split('/').pop() || 'remote';
    name = last.split('?')[0].split('#')[0];
  }
  name = name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'remote';
  if (!/\.[a-zA-Z0-9]{2,8}$/.test(name)) {
    name = `${name}.${extFromContentType(contentType)}`;
  }
  return name.slice(0, 180);
}

export function extFromContentType(contentType?: string): string {
  const type = (contentType || '').split(';')[0].trim().toLowerCase();
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
  };
  return map[type] || 'png';
}

export function looksLikeImage(buffer: Buffer, contentType?: string): boolean {
  if (!buffer || buffer.length < 4) {
    return false;
  }
  const type = (contentType || '').split(';')[0].trim().toLowerCase();
  if (type.startsWith('image/')) {
    return true;
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return true;
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    return true;
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49) {
    return true;
  }
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer.slice(8, 12).toString() === 'WEBP') {
    return true;
  }
  if (buffer.length > 12 && buffer.slice(4, 8).toString() === 'ftyp') {
    return true;
  }
  return false;
}

export function applyImageUrlMap(content: string, urlMap: Map<string, string>): string {
  if (!content || !urlMap.size) {
    return content || '';
  }
  const refs = extractImageRefs(content).sort((a, b) => b.index - a.index);
  let out = content;
  for (const ref of refs) {
    const next = urlMap.get(ref.url);
    if (!next || next === ref.url) {
      continue;
    }
    const replaced = ref.raw.includes(ref.url) ? ref.raw.replace(ref.url, next) : ref.raw;
    out = out.slice(0, ref.index) + replaced + out.slice(ref.index + ref.raw.length);
  }
  return out;
}

export function emptyTransferResult(content = ''): TransferRemoteResult {
  return {
    content: content || '',
    transferred: [],
    skipped: [],
    failed: [],
  };
}
