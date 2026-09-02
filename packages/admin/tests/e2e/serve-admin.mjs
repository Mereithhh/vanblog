import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const adminRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const bin = path.join(adminRoot, 'node_modules', '.bin');
const umi = path.join(bin, 'umi');

const child = spawn(umi, ['dev'], {
  cwd: adminRoot,
  env: {
    ...process.env,
    NODE_OPTIONS: '--openssl-legacy-provider',
    MOCK: 'none',
    UMI_ENV: 'dev',
    PORT: process.env.ADMIN_E2E_PORT || '3002',
    BROWSER: 'none',
    PATH: `${bin}:${process.env.PATH || ''}`,
  },
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
