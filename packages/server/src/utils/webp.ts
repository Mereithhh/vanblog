import { spawnSync } from 'child_process';
import { writeFileSync, readFileSync, rmSync } from 'fs';
export const compressImgToWebp = async (srcImage: Buffer) => {
  const filenameTemp = `temp${Date.now()}`;
  const p = `/tmp/${filenameTemp}`;
  const o = `/tmp/${filenameTemp}.webp`;
  writeFileSync(p, srcImage);

  spawnSync('cwebp', ['-q', '80', p, '-o', o], { stdio: 'inherit' });

  const f = readFileSync(o);
  rmSync(p);
  rmSync(o);
  return f;
};
