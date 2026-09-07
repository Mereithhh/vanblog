import { ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'src/config';
import { StoragePath } from 'src/types/setting.dto';
import { checkFolder } from './checkFolder';

export function toPosixRel(p: string): string {
  return (p || '').replace(/\\/g, '/');
}

export function normalizeCustomPageRel(...parts: string[]): string {
  const segs = parts
    .flatMap((p) => toPosixRel(p).split('/'))
    .filter((seg) => seg && seg !== '.');
  if (segs.some((seg) => seg === '..')) {
    throw new ForbiddenException('非法路径');
  }
  return segs.join('/');
}

export function resolveCustomPageAbs(...parts: string[]): string {
  const root = path.resolve(config.staticPath, StoragePath['customPage']);
  const rel = normalizeCustomPageRel(...parts);
  const abs = rel ? path.resolve(root, ...rel.split('/')) : root;
  const toRoot = path.relative(root, abs);
  if (toRoot.startsWith('..') || path.isAbsolute(toRoot)) {
    throw new ForbiddenException('非法路径');
  }
  return abs;
}

/** Split `req.url` into pathname and `?query`, ignoring hash. */
export function splitUrlPathAndSearch(url: string): { pathname: string; search: string } {
  const noHash = (url || '').split('#')[0];
  const q = noHash.indexOf('?');
  if (q === -1) {
    return { pathname: noHash, search: '' };
  }
  return { pathname: noHash.slice(0, q), search: noHash.slice(q) };
}

/**
 * Relative path under `customPage/` for a public `/c/...` request.
 * Query/hash are stripped so `/c/uptime/?x=1` maps to `uptime/`, not `uptime/?x=1`.
 */
export function publicCustomPageRelFromUrl(requestUrl: string): string {
  const { pathname } = splitUrlPathAndSearch(requestUrl);
  let rest = pathname;
  if (rest.startsWith('/c/')) {
    rest = rest.slice(3);
  } else if (rest === '/c') {
    rest = '';
  }
  try {
    rest = decodeURIComponent(rest);
  } catch {
    // keep raw if the URL is malformed
  }
  return toPosixRel(rest);
}

export type PublicCustomPageTarget =
  | { kind: 'file'; absPath: string }
  | { kind: 'redirect'; location: string }
  | { kind: 'missing' };

/**
 * Resolve a public `/c/...` request to a file, a trailing-slash redirect, or missing.
 * Directory URLs serve `index.html`; `..` and encoded `%2e%2e` are rejected.
 */
export function resolvePublicCustomPageRequest(requestUrl: string): PublicCustomPageTarget {
  const { pathname, search } = splitUrlPathAndSearch(requestUrl);
  const rel = publicCustomPageRelFromUrl(requestUrl);
  const trailingSlash = pathname.endsWith('/');
  const lastSeg = rel.split('/').filter(Boolean).pop() || '';

  const asFile = (...parts: string[]): PublicCustomPageTarget => {
    try {
      const absPath = resolveCustomPageAbs(...parts);
      if (!fs.existsSync(absPath) || checkFolder(absPath)) {
        return { kind: 'missing' };
      }
      return { kind: 'file', absPath };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        return { kind: 'missing' };
      }
      throw err;
    }
  };

  if (trailingSlash) {
    return asFile(rel, 'index.html');
  }

  try {
    if (!lastSeg.includes('.')) {
      const dirAbs = resolveCustomPageAbs(rel);
      if (checkFolder(dirAbs)) {
        return { kind: 'redirect', location: `${pathname}/${search}` };
      }
    }
  } catch (err) {
    if (err instanceof ForbiddenException) {
      return { kind: 'missing' };
    }
    throw err;
  }

  return asFile(rel);
}
