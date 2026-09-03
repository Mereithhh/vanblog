import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applyRuntimeCdnPrefix } from '../src/utils/cdnUrl';

/**
 * End-to-end of issue #450: Docker VAN_BLOG_CDN_URL must prefix
 * Next.js /_next/static assets on prerendered pages, not article images.
 */
describe('VAN_BLOG_CDN_URL prefixes intended website assets (e2e)', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-cdn-e2e-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('homepage scripts/styles use the CDN after the env is applied at startup', () => {
    const websiteRoot = path.join(tmp, 'website');
    const pagesDir = path.join(websiteRoot, 'packages', 'website', '.next', 'server', 'pages');
    fs.mkdirSync(pagesDir, { recursive: true });
    fs.writeFileSync(
      path.join(websiteRoot, 'packages', 'website', '.next', 'required-server-files.json'),
      JSON.stringify({ config: { assetPrefix: '' } }),
    );
    fs.writeFileSync(
      path.join(pagesDir, 'index.html'),
      `<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="/_next/static/css/app.css"/>
<script src="/_next/static/chunks/main.js" defer></script>
</head>
<body>
<img src="/static/img/cover.png" alt="cover"/>
<script id="__NEXT_DATA__" type="application/json">{"assetPrefix":""}</script>
</body>
</html>`,
    );

    const env = { VAN_BLOG_CDN_URL: 'https://cdn.example.com/' };
    applyRuntimeCdnPrefix(websiteRoot, env.VAN_BLOG_CDN_URL);

    const html = fs.readFileSync(path.join(pagesDir, 'index.html'), 'utf8');
    expect(html).toContain('href="https://cdn.example.com/_next/static/css/app.css"');
    expect(html).toContain('src="https://cdn.example.com/_next/static/chunks/main.js"');
    expect(html).toContain('"assetPrefix":"https://cdn.example.com"');
    expect(html).toContain('src="/static/img/cover.png"');
    expect(html).not.toContain('href="/_next/static/css/app.css"');
  });
});
