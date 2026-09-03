import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { WebsiteProvider } from './website.provider';

jest.mock('node:child_process', () => ({
  spawn: jest.fn(() => ({
    on: jest.fn(),
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
  })),
}));

const mockedSpawn = spawn as jest.MockedFunction<typeof spawn>;

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
<script src="/_next/static/chunks/main.js" defer></script>
</head>
<body>
<img src="/static/img/cover.png" alt="cover"/>
<script id="__NEXT_DATA__" type="application/json">{"assetPrefix":""}</script>
</body>
</html>`;

describe('WebsiteProvider CDN prefix', () => {
  let tmp: string;
  let prevCwd: string;
  let prevNodeEnv: string | undefined;
  let prevCdn: string | undefined;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-website-cdn-'));
    const serverDir = path.join(tmp, 'server');
    const pagesDir = path.join(tmp, 'website', 'packages', 'website', '.next', 'server', 'pages');
    fs.mkdirSync(serverDir, { recursive: true });
    fs.mkdirSync(pagesDir, { recursive: true });
    fs.writeFileSync(
      path.join(tmp, 'website', 'packages', 'website', '.next', 'required-server-files.json'),
      JSON.stringify({ config: { assetPrefix: '' } }),
    );
    fs.writeFileSync(path.join(pagesDir, 'index.html'), SAMPLE_HTML);

    prevCwd = process.cwd();
    prevNodeEnv = process.env.NODE_ENV;
    prevCdn = process.env.VAN_BLOG_CDN_URL;
    process.chdir(serverDir);
    process.env.NODE_ENV = 'production';
    process.env.VAN_BLOG_CDN_URL = 'https://cdn.example.com/';
    mockedSpawn.mockClear();
  });

  afterEach(() => {
    process.chdir(prevCwd);
    process.env.NODE_ENV = prevNodeEnv;
    if (prevCdn == null) {
      delete process.env.VAN_BLOG_CDN_URL;
    } else {
      process.env.VAN_BLOG_CDN_URL = prevCdn;
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  function createProvider() {
    return new WebsiteProvider(
      {
        getAll: jest.fn().mockResolvedValue({
          siteInfo: { baseUrl: 'https://blog.example.com' },
          socials: [],
        }),
      } as any,
      {
        getISRSetting: jest.fn().mockResolvedValue({ mode: 'onDemand' }),
      } as any,
    );
  }

  it('rewrites standalone /_next/static URLs before spawning the website', async () => {
    await createProvider().run();

    const html = fs.readFileSync(
      path.join(tmp, 'website', 'packages', 'website', '.next', 'server', 'pages', 'index.html'),
      'utf8',
    );
    const config = JSON.parse(
      fs.readFileSync(
        path.join(tmp, 'website', 'packages', 'website', '.next', 'required-server-files.json'),
        'utf8',
      ),
    );

    expect(html).toContain('src="https://cdn.example.com/_next/static/chunks/main.js"');
    expect(html).toContain('"assetPrefix":"https://cdn.example.com"');
    expect(html).toContain('src="/static/img/cover.png"');
    expect(config.config.assetPrefix).toBe('https://cdn.example.com');
    expect(mockedSpawn).toHaveBeenCalledWith(
      'node',
      ['./packages/website/server.js'],
      expect.objectContaining({
        cwd: path.join(tmp, 'website'),
        env: expect.objectContaining({
          VAN_BLOG_CDN_URL: 'https://cdn.example.com/',
        }),
      }),
    );
  });
});
