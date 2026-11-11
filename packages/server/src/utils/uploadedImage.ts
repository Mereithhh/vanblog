import { BadRequestException } from '@nestjs/common';
import { spawnSync } from 'child_process';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import Jimp from 'jimp';
import os from 'os';
import path from 'path';
import { isAvifBuffer, tryLoadSharp } from './avif';

/**
 * Raster formats the image uploader accepts.
 * SVG is omitted: it is markup (the admin picker does not offer it either),
 * and sharp would report it as `svg` rather than a bitmap container.
 */
export const UPLOAD_IMAGE_FORMATS = ['jpeg', 'png', 'gif', 'webp', 'avif'] as const;
export type UploadImageFormat = (typeof UPLOAD_IMAGE_FORMATS)[number];

const REJECT_MESSAGE = '无法解析图片，请上传 png、jpg、gif、webp 或 avif';
const PROCESS_FAILED = '图片处理失败';

export interface DecodedUploadImage {
  format: UploadImageFormat;
  ext: string;
  mime: string;
  width: number;
  height: number;
}

const EXT: Record<UploadImageFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  gif: 'gif',
  webp: 'webp',
  avif: 'avif',
};

const MIME: Record<UploadImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

function rejectImage(): never {
  throw new BadRequestException(REJECT_MESSAGE);
}

function rejectProcess(): never {
  throw new BadRequestException(PROCESS_FAILED);
}

export function sanitizeImageBaseName(originalName?: string): string {
  const normalized = String(originalName || 'image').replace(/\\/g, '/');
  const base = path.posix.basename(normalized);
  const stem = base.includes('.') ? base.slice(0, base.lastIndexOf('.')) : base;
  const cleaned = stem
    .replace(/[^\p{L}\p{N}._-]+/gu, '')
    .replace(/^\.+/, '')
    .slice(0, 80);
  return cleaned || 'image';
}

function looksLikeMarkup(buffer: Buffer): boolean {
  const sample = buffer
    .slice(0, 256)
    .toString('utf8')
    .replace(/^\uFEFF/, '')
    .trimStart()
    .toLowerCase();
  return sample.startsWith('<');
}

function asDecoded(format: UploadImageFormat, width?: number, height?: number): DecodedUploadImage {
  if (!width || !height || width < 1 || height < 1) {
    rejectImage();
  }
  return {
    format,
    ext: EXT[format],
    mime: MIME[format],
    width,
    height,
  };
}

function formatFromContainer(metaFormat: string, buffer: Buffer): UploadImageFormat | undefined {
  const format = String(metaFormat || '').toLowerCase();
  if (format === 'jpg' || format === 'jpeg') {
    return 'jpeg';
  }
  if (format === 'png' || format === 'gif' || format === 'webp' || format === 'avif') {
    return format;
  }
  // sharp reports AVIF as heif. Other HEIF (for example HEIC) stays rejected.
  if ((format === 'heif' || format === 'heic') && isAvifBuffer(buffer)) {
    return 'avif';
  }
  return undefined;
}

function isWebpBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  );
}

async function decodeWithSharp(sharp: any, buffer: Buffer): Promise<DecodedUploadImage> {
  try {
    const pipeline = sharp(buffer, {
      failOn: 'error',
      animated: false,
      limitInputPixels: 268402689,
    });
    const meta = await pipeline.metadata();
    const format = formatFromContainer(meta?.format, buffer);
    if (!format) {
      rejectImage();
    }
    const decoded = await pipeline.clone().raw().toBuffer({ resolveWithObject: true });
    if (!decoded?.data?.length) {
      rejectImage();
    }
    return asDecoded(format, decoded.info?.width || meta.width, decoded.info?.height || meta.height);
  } catch (err) {
    if (err instanceof BadRequestException) {
      throw err;
    }
    rejectImage();
  }
}

async function rasterSize(buffer: Buffer): Promise<{ width: number; height: number; format?: UploadImageFormat }> {
  try {
    const image = await Jimp.read(buffer);
    const mime = image.getMIME();
    const format =
      mime === 'image/jpeg' ? 'jpeg' : mime === 'image/png' ? 'png' : mime === 'image/gif' ? 'gif' : undefined;
    const { width, height, data } = image.bitmap;
    if (!data || data.length < width * height) {
      rejectImage();
    }
    return { width, height, format };
  } catch (err) {
    if (err instanceof BadRequestException) {
      throw err;
    }
    rejectImage();
  }
}

function transcodeToPng(command: 'dwebp' | 'avifdec', buffer: Buffer): Buffer | null {
  const id = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const input = path.join(os.tmpdir(), `vanblog-img-${id}`);
  const output = path.join(os.tmpdir(), `vanblog-img-${id}.png`);
  try {
    writeFileSync(input, buffer);
    const args = command === 'dwebp' ? [input, '-o', output] : [input, output];
    const result = spawnSync(command, args, { encoding: 'buffer' });
    if (result.error || result.status !== 0) {
      return null;
    }
    return readFileSync(output);
  } catch {
    return null;
  } finally {
    try {
      rmSync(input, { force: true });
    } catch {
      // temp input is best-effort
    }
    try {
      rmSync(output, { force: true });
    } catch {
      // temp output is best-effort
    }
  }
}

async function decodeWithoutSharp(buffer: Buffer): Promise<DecodedUploadImage> {
  if (isWebpBuffer(buffer)) {
    const png = transcodeToPng('dwebp', buffer);
    if (!png) {
      rejectImage();
    }
    const size = await rasterSize(png);
    return asDecoded('webp', size.width, size.height);
  }
  if (isAvifBuffer(buffer)) {
    const png = transcodeToPng('avifdec', buffer);
    if (!png) {
      rejectImage();
    }
    const size = await rasterSize(png);
    return asDecoded('avif', size.width, size.height);
  }
  const size = await rasterSize(buffer);
  if (!size.format) {
    rejectImage();
  }
  return asDecoded(size.format, size.width, size.height);
}

/**
 * Accept only a bitmap that a decoder can fully read.
 * Header sniffing (image-size) is not enough: a short GIF signature is a 1x1 gif there.
 */
export async function decodeUploadedImage(buffer: Buffer): Promise<DecodedUploadImage> {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12 || looksLikeMarkup(buffer)) {
    rejectImage();
  }
  const sharp = tryLoadSharp();
  if (sharp) {
    return decodeWithSharp(sharp, buffer);
  }
  return decodeWithoutSharp(buffer);
}

export function assertCompressedOutput(buffer: Buffer, format: 'webp' | 'avif') {
  if (format === 'avif') {
    if (!isAvifBuffer(buffer)) {
      rejectProcess();
    }
    return;
  }
  if (!isWebpBuffer(buffer)) {
    rejectProcess();
  }
}
