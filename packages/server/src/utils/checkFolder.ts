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

export const checkOrCreateByFilePath = (p: string) => {
  // path.dirname is OS-aware. Splitting only on `/` breaks Windows (issue #338):
  // path.join produces `\`, pop() drops the whole string, mkdir('') throws ENOENT.
  const folderPath = path.dirname(p);
  if (!folderPath || folderPath === '.') {
    return;
  }
  if (!fs.existsSync(folderPath)) {
    console.log(`${folderPath}不存在，创建。`);
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
