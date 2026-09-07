import { spawnSync } from 'child_process';
import { writeFileSync, readFileSync, rmSync } from 'fs';

export const CWEBP_QUALITY = '80';

export function buildCwebpArgv(inputPath: string, outputPath: string): string[] {
  return ['-q', CWEBP_QUALITY, inputPath, '-o', outputPath];
}

export function runCwebp(inputPath: string, outputPath: string) {
  const result = spawnSync('cwebp', buildCwebpArgv(inputPath, outputPath), {
    encoding: 'buffer',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const stderr = result.stderr?.toString?.() || '';
    throw new Error(stderr || `cwebp exited with status ${result.status}`);
  }
  return result;
}

export const compressImgToWebp = async (srcImage: Buffer) => {
  const filenameTemp = `temp${Date.now()}`;
  const p = `/tmp/${filenameTemp}`;
  const o = `/tmp/${filenameTemp}.webp`;
  writeFileSync(p, srcImage);

  runCwebp(p, o);

  const f = readFileSync(o);
  rmSync(p);
  rmSync(o);
  return f;
};
