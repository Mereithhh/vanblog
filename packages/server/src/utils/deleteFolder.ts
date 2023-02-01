import { execSync } from 'child_process';
export const rmDir = (p: string) => {
  execSync(`rm -rf ${p}`);
};
