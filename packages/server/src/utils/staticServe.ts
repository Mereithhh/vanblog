import { BadRequestException } from '@nestjs/common';
import path from 'path';

/** Extensions that may be written by the image pipeline. */
export const STORED_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif']);

/**
 * Extensions that may be served from the image upload directories.
 * ico/bmp stay so older favicons and bitmaps already on disk still load.
 * html, svg, and script types are intentionally absent.
 */
export const SERVE_IMAGE_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
};

export const UPLOAD_STATIC_CSP = "default-src 'none'; script-src 'none'; sandbox";

type HeaderResponse = {
  setHeader(name: string, value: string): void;
  status?(code: number): { send(body?: string): void; end(): void };
  end?(): void;
};

export function extensionOf(filePath: string): string {
  const base = filePath.split('?')[0].split('#')[0];
  const name = base.slice(base.lastIndexOf('/') + 1);
  if (!name.includes('.')) {
    return '';
  }
  return name.slice(name.lastIndexOf('.') + 1).toLowerCase();
}

export function resolveSafeImagePath(rootDir: string, fileName: string): string {
  const safeName = path.basename(fileName);
  if (!safeName || safeName !== fileName || safeName.includes('..') || safeName.includes('\0')) {
    throw new BadRequestException('非法文件名');
  }
  const ext = extensionOf(safeName);
  if (!STORED_IMAGE_EXTENSIONS.has(ext)) {
    throw new BadRequestException('无法解析图片');
  }
  const dir = path.resolve(rootDir);
  const srcPath = path.resolve(dir, safeName);
  const rel = path.relative(dir, srcPath);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new BadRequestException('非法文件名');
  }
  return srcPath;
}

function rawPathname(req: { originalUrl?: string; url?: string }): string {
  return String(req.originalUrl || req.url || '').split('?')[0].split('#')[0];
}

function decodePathname(pathOnly: string): string | null {
  if (!pathOnly || pathOnly.includes('\0')) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(pathOnly);
    if (decoded.includes('\0')) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function uploadRelative(pathname: string): string | null {
  const matched = pathname.match(/^\/static\/(img|tmp)\/(.+)$/);
  if (!matched) {
    return null;
  }
  return matched[2];
}

function isSingleFileName(rel: string): boolean {
  return Boolean(rel) && !rel.includes('/') && !rel.includes('\\') && !rel.includes('..') && !rel.includes('\0');
}

function denyUpload(res: HeaderResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', UPLOAD_STATIC_CSP);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (res.status) {
    res.status(404).send('Not found');
    return;
  }
  res.end?.();
}

/**
 * Image upload directories only respond for a single image file.
 * Anything else, including html and svg, is not served.
 */
export function guardUploadStatic(req: { originalUrl?: string; url?: string }, res: HeaderResponse, next: () => void) {
  const raw = rawPathname(req);
  const pathname = decodePathname(raw);
  if (pathname == null) {
    const lower = raw.toLowerCase();
    if (lower.startsWith('/static/img') || lower.startsWith('/static/tmp')) {
      denyUpload(res);
      return;
    }
    next();
    return;
  }
  const rel = uploadRelative(pathname);
  if (rel == null) {
    next();
    return;
  }
  const mime = isSingleFileName(rel) ? SERVE_IMAGE_MIME[extensionOf(rel)] : undefined;
  if (!mime) {
    denyUpload(res);
    return;
  }
  res.setHeader('Content-Type', mime);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', UPLOAD_STATIC_CSP);
  res.setHeader('Content-Disposition', 'inline');
  next();
}

export function applyStaticFileHeaders(res: { setHeader(name: string, value: string): void }, filePath: string) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const ext = extensionOf(filePath);
  const parent = path.basename(path.dirname(filePath));
  const mime = SERVE_IMAGE_MIME[ext];
  if (parent === 'img' || parent === 'tmp') {
    if (mime) {
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Security-Policy', UPLOAD_STATIC_CSP);
      res.setHeader('Content-Disposition', 'inline');
    }
    return;
  }
  if (ext === 'webp' || ext === 'avif') {
    res.setHeader('Content-Type', SERVE_IMAGE_MIME[ext]);
  }
}
