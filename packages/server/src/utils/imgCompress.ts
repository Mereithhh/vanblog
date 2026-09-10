import { BadRequestException } from '@nestjs/common';
import { compressImgToWebp, CWEBP_QUALITY } from './webp';
import { compressImgToAvif, tryLoadSharp } from './avif';

export const COMPRESS_FORMATS = ['webp', 'avif'] as const;
export type CompressFormat = (typeof COMPRESS_FORMATS)[number];
export const DEFAULT_COMPRESS_FORMAT: CompressFormat = 'webp';

export const COMPRESS_MIME: Record<CompressFormat, string> = {
  webp: 'image/webp',
  avif: 'image/avif',
};

export function isCompressFormat(value: unknown): value is CompressFormat {
  return value === 'webp' || value === 'avif';
}

/**
 * Missing / empty values keep today's WebP default.
 * Anything else that is not webp|avif is rejected (do not silently coerce).
 */
export function parseCompressFormat(value: unknown): CompressFormat {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_COMPRESS_FORMAT;
  }
  const normalized = String(value).trim().toLowerCase();
  if (isCompressFormat(normalized)) {
    return normalized;
  }
  throw new BadRequestException(`不支持的图片压缩格式：${value}，可选 webp 或 avif`);
}

/** Read path: missing or corrupt stored values keep WebP. Write path still rejects. */
export function resolveCompressFormat(value: unknown): CompressFormat {
  try {
    return parseCompressFormat(value);
  } catch {
    return DEFAULT_COMPRESS_FORMAT;
  }
}

export function compressExt(format: CompressFormat): CompressFormat {
  return format;
}

export function compressMime(format: CompressFormat): string {
  return COMPRESS_MIME[format];
}

export function contentTypeForExt(ext: string): string | undefined {
  const normalized = String(ext || '')
    .replace(/^\./, '')
    .trim()
    .toLowerCase();
  if (isCompressFormat(normalized)) {
    return COMPRESS_MIME[normalized];
  }
  return undefined;
}

export function applyStaticAssetHeaders(
  res: { setHeader(name: string, value: string): void },
  filePath: string,
) {
  const ext = filePath.includes('.') ? filePath.slice(filePath.lastIndexOf('.') + 1) : '';
  const type = contentTypeForExt(ext);
  if (type) {
    res.setHeader('Content-Type', type);
  }
}

export async function compressImg(
  srcImage: Buffer,
  format: unknown = DEFAULT_COMPRESS_FORMAT,
): Promise<Buffer> {
  const resolved = parseCompressFormat(format);
  if (resolved === 'avif') {
    return compressImgToAvif(srcImage);
  }
  try {
    return await compressImgToWebp(srcImage);
  } catch (err) {
    const sharp = tryLoadSharp();
    if (!sharp) {
      throw err;
    }
    return sharp(srcImage).webp({ quality: Number(CWEBP_QUALITY) }).toBuffer();
  }
}
