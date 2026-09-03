import * as fs from 'fs';

export const rmDir = (p: string) => {
  fs.rmSync(p, { recursive: true, force: true });
};
