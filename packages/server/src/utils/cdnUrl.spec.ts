import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  applyAssetPrefixToHtml,
  applyRuntimeCdnPrefix,
  getWebsiteRoot,
  normalizeCdnUrl,
} from './cdnUrl';

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
<link rel="preload" href="/_next/static/css/app.css" as="style"/>
<link rel="stylesheet" href="/_next/static/css/app.css"/>
<script src="/_next/static/chunks/webpack.js" defer></script>
<script src="/_next/static/chunks/main.js" defer></script>
</head>
<body>
<img src="/static/img/cover.png" alt="cover"/>
<img src="https://pic.example.com/photo.jpg" alt="remote"/>
<script id="__NEXT_DATA__" type="application/json">{"props":{},"assetPrefix":""}</script>
</body>
</html>`;

describe('normalizeCdnUrl', () => {
  it('trims and strips trailing slashes', () => {
    expect(normalizeCdnUrl(' https://cdn.example.com/ ')).toBe('https://cdn.example.com');
    expect(normalizeCdnUrl('https://cdn.example.com///')).toBe('https://cdn.example.com');
  });

  it('treats empty values as no CDN', () => {
    expect(normalizeCdnUrl('')).toBe('');
    expect(normalizeCdnUrl('   ')).toBe('');
    expect(normalizeCdnUrl(undefined)).toBe('');
    expect(normalizeCdnUrl(null)).toBe('');
  });
});

describe('applyAssetPrefixToHtml', () => {
  it('prefixes /_next/static assets and __NEXT_DATA__.assetPrefix', () => {
    const html = applyAssetPrefixToHtml(SAMPLE_HTML, 'https://cdn.example.com/');

    expect(html).toContain('href="https://cdn.example.com/_next/static/css/app.css"');
    expect(html).toContain('src="https://cdn.example.com/_next/static/chunks/main.js"');
    expect(html).toContain('"assetPrefix":"https://cdn.example.com"');
    expect(html).not.toContain('src="/_next/static/chunks/main.js"');
  });

  it('does not rewrite article images or local /static uploads', () => {
    const html = applyAssetPrefixToHtml(SAMPLE_HTML, 'https://cdn.example.com');
    expect(html).toContain('src="/static/img/cover.png"');
    expect(html).toContain('src="https://pic.example.com/photo.jpg"');
  });

  it('is idempotent when applied twice', () => {
    const once = applyAssetPrefixToHtml(SAMPLE_HTML, 'https://cdn.example.com');
    const twice = applyAssetPrefixToHtml(once, 'https://cdn.example.com');
    expect(twice).toBe(once);
    expect(twice.match(/https:\/\/cdn\.example\.com\/_next\/static\/chunks\/main\.js/g)).toHaveLength(
      1,
    );
  });

  it('leaves HTML unchanged when CDN is unset', () => {
    expect(applyAssetPrefixToHtml(SAMPLE_HTML, '')).toBe(SAMPLE_HTML);
  });
});

describe('applyRuntimeCdnPrefix', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-cdn-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  function writeStandaloneFixture(websiteRoot: string) {
    const standalone = path.join(websiteRoot, 'packages', 'website');
    const serverPages = path.join(standalone, '.next', 'server', 'pages');
    fs.mkdirSync(serverPages, { recursive: true });
    fs.writeFileSync(
      path.join(standalone, '.next', 'required-server-files.json'),
      JSON.stringify({
        version: 1,
        config: { assetPrefix: '', images: { domains: [] } },
      }),
    );
    fs.writeFileSync(path.join(serverPages, 'index.html'), SAMPLE_HTML);
    fs.writeFileSync(path.join(serverPages, 'about.html'), SAMPLE_HTML);
    return standalone;
  }

  it('applies VAN_BLOG_CDN_URL to standalone config and prerendered HTML', () => {
    const websiteRoot = path.join(tmp, 'website');
    const standalone = writeStandaloneFixture(websiteRoot);

    const result = applyRuntimeCdnPrefix(websiteRoot, 'https://cdn.example.com/');

    expect(result).toEqual({
      assetPrefix: 'https://cdn.example.com',
      patchedConfig: true,
      rewrittenHtml: 2,
    });

    const config = JSON.parse(
      fs.readFileSync(path.join(standalone, '.next', 'required-server-files.json'), 'utf8'),
    );
    expect(config.config.assetPrefix).toBe('https://cdn.example.com');
    expect(config.config.images.domains).toEqual([]);

    const index = fs.readFileSync(path.join(standalone, '.next', 'server', 'pages', 'index.html'), 'utf8');
    expect(index).toContain('src="https://cdn.example.com/_next/static/chunks/main.js"');
    expect(index).toContain('href="https://cdn.example.com/_next/static/css/app.css"');
    expect(index).toContain('"assetPrefix":"https://cdn.example.com"');
    expect(index).toContain('src="/static/img/cover.png"');
  });

  it('clears baked assetPrefix when the env is removed', () => {
    const websiteRoot = path.join(tmp, 'website');
    const standalone = writeStandaloneFixture(websiteRoot);
    applyRuntimeCdnPrefix(websiteRoot, 'https://cdn.example.com');
    applyRuntimeCdnPrefix(websiteRoot, '');

    const config = JSON.parse(
      fs.readFileSync(path.join(standalone, '.next', 'required-server-files.json'), 'utf8'),
    );
    expect(config.config.assetPrefix).toBe('');
  });

  it('is a no-op when standalone output is missing', () => {
    const websiteRoot = path.join(tmp, 'website');
    fs.mkdirSync(websiteRoot, { recursive: true });
    expect(applyRuntimeCdnPrefix(websiteRoot, 'https://cdn.example.com')).toEqual({
      assetPrefix: 'https://cdn.example.com',
      patchedConfig: false,
      rewrittenHtml: 0,
    });
  });
});

describe('getWebsiteRoot', () => {
  it('resolves ../website from the server cwd (Docker /app/server)', () => {
    expect(getWebsiteRoot('/app/server')).toBe(path.resolve('/app/website'));
  });
});
