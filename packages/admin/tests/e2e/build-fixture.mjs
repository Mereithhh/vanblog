import { cp, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, 'fixtures');
const outdir = path.join(fixtures, 'dist');
const adminRoot = path.resolve(here, '..', '..');

await mkdir(outdir, { recursive: true });

const esbuildBin = path.join(adminRoot, 'node_modules', '.bin', 'esbuild');

await new Promise((resolve, reject) => {
  const child = spawn(
    esbuildBin,
    [
      path.join(fixtures, 'mermaid-editor-app.ts'),
      `--outfile=${path.join(outdir, 'app.js')}`,
      '--bundle',
      '--format=iife',
      '--platform=browser',
      '--loader:.md=text',
    ],
    { cwd: adminRoot, stdio: 'inherit' },
  );
  child.on('exit', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`esbuild failed with code ${code}`));
  });
});

await cp(path.join(fixtures, 'index.html'), path.join(outdir, 'index.html'));
await cp(
  path.join(adminRoot, 'src/components/Editor/mermaid-safety.css'),
  path.join(outdir, 'mermaid-safety.css'),
);
await cp(path.join(adminRoot, 'node_modules/bytemd/dist/index.css'), path.join(outdir, 'bytemd.css'));
