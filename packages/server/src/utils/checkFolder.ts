import * as fs from 'fs';
export const checkOrCreate = (p: string) => {
  try {
    fs.readdirSync(p);
  } catch (err) {
    console.log(`${p}不存在，创建。`);
    fs.mkdirSync(p, { recursive: true });
  }
};
