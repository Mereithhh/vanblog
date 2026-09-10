import { cp, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

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
await bundle(path.join(fixtures, 'code-block-article-app.tsx'), path.join(outdir, 'code-block.js'), [
  `--alias:react=${react}`,
  `--alias:react-dom=${reactDom}`,
  '--jsx=automatic',
]);
await bundle(path.join(fixtures, 'social-card-app.tsx'), path.join(outdir, 'social-card.js'), [
  `--alias:react=${react}`,
  `--alias:react-dom=${reactDom}`,
  '--jsx=automatic',
]);
await bundle(path.join(fixtures, 'page-nav-app.tsx'), path.join(outdir, 'page-nav.js'), [
  `--alias:react=${react}`,
  `--alias:react-dom=${reactDom}`,
  `--alias:next/link=${path.join(fixtures, 'next-link.tsx')}`,
  `--alias:next/router=${path.join(fixtures, 'next-router.ts')}`,
  '--jsx=automatic',
]);
await bundle(path.join(fixtures, 'article-cover-app.tsx'), path.join(outdir, 'article-cover.js'), [
  `--alias:react=${react}`,
  `--alias:react-dom=${reactDom}`,
  '--jsx=automatic',
]);
await esbuild.build({
  entryPoints: [path.join(fixtures, 'nav-bar-app.tsx')],
  outfile: path.join(outdir, 'nav-bar.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  alias: {
    react,
    'react-dom': reactDom,
    'next/link': path.join(fixtures, 'next-link.tsx'),
    'next/router': path.join(fixtures, 'nav-router.ts'),
    'headroom.js': path.join(fixtures, 'headroom-stub.js'),
  },
  plugins: [
    {
      name: 'stub-search-card',
      setup(build) {
        const stub = path.join(fixtures, 'search-card-stub.tsx');
        build.onResolve({ filter: /SearchCard$/ }, () => ({ path: stub }));
      },
    },
  ],
});

await cp(path.join(fixtures, 'index.html'), path.join(outdir, 'index.html'));
await cp(path.join(fixtures, 'toc-article.html'), path.join(outdir, 'toc-article.html'));
await cp(path.join(fixtures, 'footnote-article.html'), path.join(outdir, 'footnote-article.html'));
await cp(
  path.join(fixtures, 'markdown-link-article.html'),
  path.join(outdir, 'markdown-link-article.html'),
);
await cp(
  path.join(fixtures, 'code-block-article.html'),
  path.join(outdir, 'code-block-article.html'),
);
await cp(path.join(fixtures, 'social-card.html'), path.join(outdir, 'social-card.html'));
await cp(path.join(fixtures, 'page-nav.html'), path.join(outdir, 'page-nav.html'));
await cp(path.join(fixtures, 'article-cover.html'), path.join(outdir, 'article-cover.html'));
await cp(path.join(fixtures, 'cover.png'), path.join(outdir, 'cover.png'));
await cp(path.join(fixtures, 'nav-bar.html'), path.join(outdir, 'nav-bar.html'));
await cp(
  path.resolve(adminRoot, '../website/components/NavBar/siteNameLayout.css'),
  path.join(outdir, 'nav-bar-layout.css'),
);
await cp(
  path.resolve(adminRoot, '../website/styles/github-markdown.css'),
  path.join(outdir, 'github-markdown.css'),
);
await cp(
  path.resolve(adminRoot, '../website/styles/code-light.css'),
  path.join(outdir, 'code-light.css'),
);
await cp(
  path.resolve(adminRoot, '../website/styles/code-dark.css'),
  path.join(outdir, 'code-dark.css'),
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
