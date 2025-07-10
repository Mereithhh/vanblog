import { spawnSync } from 'child_process';
export const rmDir = (p: string) => {
  spawnSync('rm', ['-rf', p], { stdio: 'inherit' });
};
