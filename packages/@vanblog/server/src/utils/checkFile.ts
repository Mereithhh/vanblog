import * as fs from 'fs';
import { checkOrCreateByFilePath } from './checkFolder';

export const checkOrCreateFile = (p: string) => {
  checkOrCreateByFilePath(p);
  try {
    fs.readFileSync(p);
  } catch (err) {
    console.log(`${p}不存在，创建。`);
    fs.writeFileSync(p, '', { encoding: 'utf-8' });
  }
};
