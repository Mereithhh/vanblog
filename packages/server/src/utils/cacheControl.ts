/**
 * Cache directives so Cloudflare / CDNs do not store admin HTML or admin API
 * responses when a broad "cache everything" page rule is in front of VanBlog.
 * @see https://github.com/Mereithhh/vanblog/issues/140
 */
export const NO_STORE_CACHE_CONTROL =
  'private, no-store, no-cache, must-revalidate';
export const CDN_NO_STORE = 'no-store';
export const PRAGMA_NO_CACHE = 'no-cache';
export const EXPIRES_IMMEDIATELY = '0';

export const ADMIN_NO_STORE_HEADER_MAP = {
  'Cache-Control': NO_STORE_CACHE_CONTROL,
  'CDN-Cache-Control': CDN_NO_STORE,
  'Cloudflare-CDN-Cache-Control': CDN_NO_STORE,
  Pragma: PRAGMA_NO_CACHE,
  Expires: EXPIRES_IMMEDIATELY,
} as const;

export type HeaderSetter = {
  setHeader(name: string, value: string): unknown;
};

export function normalizeRequestPath(input: string): string {
  if (!input) {
    return '/';
  }
  const withoutQuery = input.split('?')[0].split('#')[0];
  let path = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  if (path.length > 1) {
    path = path.replace(/\/+$/, '');
  }
  return path || '/';
}

export function pathFromRequest(req: {
  path?: string;
  originalUrl?: string;
  url?: string;
}): string {
  return normalizeRequestPath(req.originalUrl || req.url || req.path || '/');
}

/**
 * `/admin` SPA and `/api/admin/*` JSON (including `/api/admin/auth/login`).
 * Does not match public article HTML, `/api/public/*`, or `/_next/static`.
 */
export function isAdminNoStorePath(pathname: string): boolean {
  const path = normalizeRequestPath(pathname);
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path === '/api/admin' ||
    path.startsWith('/api/admin/')
  );
}

export function applyNoStoreCacheHeaders(res: HeaderSetter): void {
  res.setHeader('Cache-Control', NO_STORE_CACHE_CONTROL);
  res.setHeader('CDN-Cache-Control', CDN_NO_STORE);
  res.setHeader('Cloudflare-CDN-Cache-Control', CDN_NO_STORE);
  res.setHeader('Pragma', PRAGMA_NO_CACHE);
  res.setHeader('Expires', EXPIRES_IMMEDIATELY);
}

export function hasNoStoreCachePolicy(headers: {
  [key: string]: string | string[] | undefined;
}): boolean {
  const cacheControl = String(headers['cache-control'] || headers['Cache-Control'] || '');
  const cdn = String(
    headers['cdn-cache-control'] || headers['CDN-Cache-Control'] || '',
  );
  const cf = String(
    headers['cloudflare-cdn-cache-control'] ||
      headers['Cloudflare-CDN-Cache-Control'] ||
      '',
  );
  return (
    /no-store/i.test(cacheControl) &&
    /private/i.test(cacheControl) &&
    /no-store/i.test(cdn) &&
    /no-store/i.test(cf)
  );
}
