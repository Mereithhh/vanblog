import { spawnSync } from 'child_process';
import { writeFileSync, readFileSync, rmSync } from 'fs';
import path from 'path';

export const AVIF_QUALITY = 50;

export type SharpEncoder = (input: Buffer) => {
  avif: (opts: { quality: number }) => { toBuffer: () => Promise<Buffer> };
  webp: (opts: { quality: number }) => { toBuffer: () => Promise<Buffer> };
};

/**
 * Official image: website already ships Alpine musl sharp@0.32.6 under
 * /app/website. Server is built on Debian, so its own node_modules/sharp
 * (if present) may be glibc and fail on musl — catch and try the next path.
 * Last resort: avifenc from apk `libavif-apps` (see root Dockerfile RUNNER).
 */
export function sharpAvifCandidates(): string[] {
  return [
    'sharp',
    '/app/website/node_modules/sharp',
    '/app/website/packages/website/node_modules/sharp',
    path.resolve(__dirname, '../../../website/node_modules/sharp'),
  ];
}

export function tryLoadSharp(): SharpEncoder | null {
  for (const id of sharpAvifCandidates()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(id);
      const sharp = (mod && (mod.default || mod)) as SharpEncoder;
      if (typeof sharp === 'function') {
        return sharp;
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export function buildAvifencArgv(inputPath: string, outputPath: string): string[] {
  return ['-q', String(AVIF_QUALITY), inputPath, outputPath];
}

export function runAvifenc(inputPath: string, outputPath: string) {
  const result = spawnSync('avifenc', buildAvifencArgv(inputPath, outputPath), {
    encoding: 'buffer',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const stderr = result.stderr?.toString?.() || '';
    throw new Error(stderr || `avifenc exited with status ${result.status}`);
  }
  return result;
}

export function isAvifBuffer(buf: Buffer): boolean {
  if (!buf || buf.length < 12) {
    return false;
  }
  if (buf.toString('ascii', 4, 8) !== 'ftyp') {
    return false;
  }
  return buf.includes(Buffer.from('avif'));
}

export async function compressImgToAvif(srcImage: Buffer): Promise<Buffer> {
  const sharp = tryLoadSharp();
  if (sharp) {
    return sharp(srcImage).avif({ quality: AVIF_QUALITY }).toBuffer();
  }
  return compressImgToAvifCli(srcImage);
}

export async function compressImgToAvifCli(srcImage: Buffer): Promise<Buffer> {
  const filenameTemp = `temp-avif-${Date.now()}`;
  const p = `/tmp/${filenameTemp}`;
  const o = `/tmp/${filenameTemp}.avif`;
  writeFileSync(p, srcImage);
  try {
    runAvifenc(p, o);
    return readFileSync(o);
  } finally {
    try {
      rmSync(p);
    } catch {
      // ignore
    }
    try {
      rmSync(o);
    } catch {
      // ignore
    }
  }
}
