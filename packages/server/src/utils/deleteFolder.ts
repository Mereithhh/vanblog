import { rmSync } from 'fs';

export const rmDir = (p: string) => {
  rmSync(p, { recursive: true, force: true });
};
