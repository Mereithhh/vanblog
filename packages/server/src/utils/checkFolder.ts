import * as fs from 'fs';
import * as path from 'path';

export const checkOrCreate = (p: string) => {
  try {
    fs.readdirSync(p);
  } catch (err) {
    console.log(`${p}不存在，创建。`);
    fs.mkdirSync(p, { recursive: true });
  }
};

export const checkFolder = (p: string) => {
  try {
    fs.readdirSync(p);
  } catch (err) {
    return false;
  }
  return true;
};

/**
 * Ensure the parent directory of a file path exists.
 * Must accept both POSIX `/` and Windows `\` separators: on Win11,
 * path.join() yields `\static\customPage\page\file.md`, and splitting
 * only on `/` used to produce an empty folder path → mkdir ENOENT (#338).
 */
export const checkOrCreateByFilePath = (p: string) => {
  if (!p) {
    return;
  }
  const normalized = p.replace(/[\\/]+/g, path.sep);
  const folderPath = path.dirname(normalized);
  if (!folderPath || folderPath === '.' || folderPath === path.parse(folderPath).root) {
    return;
  }
  if (!fs.existsSync(folderPath)) {
    console.log(`${folderPath}不存在，创建。`);
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
