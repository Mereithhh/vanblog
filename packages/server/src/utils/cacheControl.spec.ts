import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ADMIN_NO_STORE_HEADER_MAP,
  CDN_NO_STORE,
  NO_STORE_CACHE_CONTROL,
  applyNoStoreCacheHeaders,
  hasNoStoreCachePolicy,
  isAdminNoStorePath,
  normalizeRequestPath,
  pathFromRequest,
} from './cacheControl';

const repoRoot = path.resolve(__dirname, '../../../..');

describe('normalizeRequestPath', () => {
  it('strips query, hash, and trailing slashes', () => {
    expect(normalizeRequestPath('/api/admin/meta?page=1')).toBe('/api/admin/meta');
    expect(normalizeRequestPath('/admin/?x=1#hash')).toBe('/admin');
    expect(normalizeRequestPath('admin/user/login')).toBe('/admin/user/login');
  });
});

describe('isAdminNoStorePath (#140)', () => {
  it.each([
    '/admin',
    '/admin/',
    '/admin/user/login',
    '/admin/article',
    '/api/admin',
    '/api/admin/',
    '/api/admin/meta',
    '/api/admin/auth/login',
    '/api/admin/article?page=1',
  ])('treats %s as admin/auth traffic that must not be stored', (pathname) => {
    expect(isAdminNoStorePath(pathname)).toBe(true);
  });

  it.each([
    '/',
    '/post/hello',
    '/api/public/article/1',
    '/api/public/meta',
    '/_next/static/chunks/main.js',
    '/static/img/cover.png',
    '/api/comment',
    '/administrator',
    '/api/administrator',
    '/rss/feed.xml',
  ])('does not force no-store on public path %s', (pathname) => {
    expect(isAdminNoStorePath(pathname)).toBe(false);
  });
});

describe('applyNoStoreCacheHeaders', () => {
  it('sets private no-store plus CDN / Cloudflare no-store', () => {
    const headers: Record<string, string> = {};
    applyNoStoreCacheHeaders({
      setHeader(name, value) {
        headers[name] = value;
      },
    });
    expect(headers['Cache-Control']).toBe(NO_STORE_CACHE_CONTROL);
    expect(headers['CDN-Cache-Control']).toBe(CDN_NO_STORE);
    expect(headers['Cloudflare-CDN-Cache-Control']).toBe(CDN_NO_STORE);
    expect(headers.Pragma).toBe('no-cache');
    expect(headers.Expires).toBe('0');
    expect(hasNoStoreCachePolicy(headers)).toBe(true);
    expect(ADMIN_NO_STORE_HEADER_MAP['Cache-Control']).toContain('no-store');
  });
});

describe('pathFromRequest', () => {
  it('prefers originalUrl so query strings still match /api/admin', () => {
    expect(
      pathFromRequest({
        originalUrl: '/api/admin/meta?page=1',
        url: '/meta?page=1',
        path: '/meta',
      }),
    ).toBe('/api/admin/meta');
  });
});

describe('origin templates advertise no-store for admin', () => {
  const caddyJson = fs.readFileSync(path.join(repoRoot, 'caddyTemplate.json'), 'utf8');
  const caddyfile = fs.readFileSync(path.join(repoRoot, 'CaddyfileTemplate'), 'utf8');
  const caddyLocal = fs.readFileSync(path.join(repoRoot, 'CaddyfileTemplateLocal'), 'utf8');

  it('Caddy JSON sets no-store on /admin* and /api/admin*', () => {
    const parsed = JSON.parse(caddyJson);
    const routes = parsed.apps.http.servers.srv0.routes as any[];
    const admin = routes.find((route) => route.match?.[0]?.path?.includes('/admin*'));
    const adminApi = routes.find((route) =>
      route.match?.[0]?.path?.includes('/api/admin*'),
    );
    expect(JSON.stringify(admin)).toMatch(/Cloudflare-CDN-Cache-Control/);
    expect(JSON.stringify(admin)).toMatch(/no-store/);
    expect(JSON.stringify(adminApi)).toMatch(/Cloudflare-CDN-Cache-Control/);
    expect(JSON.stringify(adminApi)).toMatch(/no-store/);
    const publicApi = routes.find((route) => {
      const paths = route.match?.[0]?.path || [];
      return paths.includes('/api/*') && !paths.includes('/api/admin*');
    });
    expect(JSON.stringify(publicApi)).not.toMatch(/Cloudflare-CDN-Cache-Control/);
  });

  it('Caddyfile templates set no-store on /admin* and /api/admin*', () => {
    for (const text of [caddyfile, caddyLocal]) {
      expect(text).toMatch(/handle \/api\/admin\*/);
      expect(text).toMatch(/handle_path \/admin\*/);
      expect(text).toMatch(/Cloudflare-CDN-Cache-Control/);
      expect(text).toMatch(/CDN-Cache-Control/);
      expect(text).toMatch(/private, no-store, no-cache, must-revalidate/);
    }
  });

  it('NestJS AppModule registers NoStoreCacheMiddleware on all routes', () => {
    const src = fs.readFileSync(
      path.join(repoRoot, 'packages/server/src/app.module.ts'),
      'utf8',
    );
    expect(src).toMatch(/NoStoreCacheMiddleware/);
    expect(src).toMatch(/consumer.apply\(NoStoreCacheMiddleware\)/);
  });
});
