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

function bundle(entry, outfile, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      esbuildBin,
      [
        entry,
        `--outfile=${outfile}`,
        '--bundle',
        '--format=iife',
        '--platform=browser',
        '--loader:.md=text',
        ...extraArgs,
      ],
      { cwd: adminRoot, stdio: 'inherit' },
    );
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`esbuild failed with code ${code} for ${entry}`));
    });
  });
}

const react = path.join(adminRoot, 'node_modules/react');
const reactDom = path.join(adminRoot, 'node_modules/react-dom');

await bundle(path.join(fixtures, 'mermaid-editor-app.ts'), path.join(outdir, 'app.js'));
// Website TOC/heading components resolve their own React 18; alias to the
// admin copy so the IIFE has a single React (duplicate copies crash useMemo).
await bundle(path.join(fixtures, 'toc-article-app.tsx'), path.join(outdir, 'toc.js'), [
  `--alias:react=${react}`,
  `--alias:react-dom=${reactDom}`,
  '--jsx=automatic',
]);
await bundle(path.join(fixtures, 'footnote-article-app.tsx'), path.join(outdir, 'footnote.js'), [
  `--alias:react=${react}`,
  `--alias:react-dom=${reactDom}`,
  '--jsx=automatic',
]);
await bundle(path.join(fixtures, 'markdown-link-article-app.tsx'), path.join(outdir, 'markdown-link.js'), [
  `--alias:react=${react}`,
  `--alias:react-dom=${reactDom}`,
  '--jsx=automatic',
]);

await cp(path.join(fixtures, 'index.html'), path.join(outdir, 'index.html'));
await cp(path.join(fixtures, 'toc-article.html'), path.join(outdir, 'toc-article.html'));
await cp(path.join(fixtures, 'footnote-article.html'), path.join(outdir, 'footnote-article.html'));
await cp(
  path.join(fixtures, 'markdown-link-article.html'),
  path.join(outdir, 'markdown-link-article.html'),
);
await cp(
  path.resolve(adminRoot, '../website/styles/github-markdown.css'),
  path.join(outdir, 'github-markdown.css'),
);
await cp(
  path.join(adminRoot, 'src/components/Editor/mermaid-safety.css'),
  path.join(outdir, 'mermaid-safety.css'),
);
await cp(path.join(adminRoot, 'node_modules/bytemd/dist/index.css'), path.join(outdir, 'bytemd.css'));
await cp(
  path.join(adminRoot, 'node_modules/katex/dist/katex.min.css'),
  path.join(outdir, 'katex.min.css'),
);
