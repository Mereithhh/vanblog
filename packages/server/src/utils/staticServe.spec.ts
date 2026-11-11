import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import express from 'express';
import request from 'supertest';
import { applyStaticFileHeaders, guardUploadStatic, UPLOAD_STATIC_CSP } from './staticServe';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('upload static serving', () => {
  let tmp: string;
  let app: express.Express;

  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-static-'));
    fs.mkdirSync(path.join(tmp, 'img'));
    fs.mkdirSync(path.join(tmp, 'customPage', 'door'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'img', 'cover.png'), PNG_1X1);
    fs.writeFileSync(path.join(tmp, 'img', 'old.html'), '<html><body>marker-html</body></html>');
    fs.writeFileSync(
      path.join(tmp, 'img', 'old.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>',
    );
    fs.writeFileSync(path.join(tmp, 'customPage', 'door', 'index.html'), '<html>page</html>');
    app = express();
    app.use(guardUploadStatic as express.RequestHandler);
    app.use(
      '/static',
      express.static(tmp, {
        setHeaders: applyStaticFileHeaders,
      }),
    );
  });

  afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('serves a real image with an image type and nosniff', async () => {
    const res = await request(app).get('/static/img/cover.png').expect(200);
    expect(res.headers['content-type']).toMatch(/image\/png/);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBe(UPLOAD_STATIC_CSP);
    expect(res.body.equals(PNG_1X1)).toBe(true);
  });

  it('does not serve html or svg from the image directory', async () => {
    for (const name of ['old.html', 'old.svg', 'nested/old.html']) {
      const res = await request(app).get(`/static/img/${name}`);
      expect(res.status).toBe(404);
      expect(String(res.headers['content-type'] || '')).not.toMatch(/text\/html|image\/svg/);
      expect(res.text).not.toContain('marker-html');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    }
  });

  it('still serves custom page html outside the image directory', async () => {
    const res = await request(app).get('/static/customPage/door/index.html').expect(200);
    expect(res.text).toContain('page');
  });
});

describe('static templates', () => {
  const repoRoot = path.resolve(__dirname, '../../../..');

  it('asks the proxy to mark /static image paths as nosniff', () => {
    for (const name of ['CaddyfileTemplate', 'CaddyfileTemplateLocal']) {
      const text = fs.readFileSync(path.join(repoRoot, name), 'utf8');
      const imgAt = text.indexOf('handle /static/img/*');
      const tmpAt = text.indexOf('handle /static/tmp/*');
      expect(imgAt).toBeGreaterThan(-1);
      expect(tmpAt).toBeGreaterThan(-1);
      const imgBlock = text.slice(imgAt, imgAt + 280);
      const tmpBlock = text.slice(tmpAt, tmpAt + 280);
      expect(imgBlock).toMatch(/X-Content-Type-Options nosniff/);
      expect(imgBlock).toMatch(/sandbox/);
      expect(tmpBlock).toMatch(/X-Content-Type-Options nosniff/);
    }
    const raw = fs.readFileSync(path.join(repoRoot, 'caddyTemplate.json'), 'utf8');
    const parsed = JSON.parse(raw);
    const routes = parsed.apps.http.servers.srv0.routes as any[];
    const img = routes.find((route) => route.match?.[0]?.path?.includes('/static/img/*'));
    expect(JSON.stringify(img)).toMatch(/nosniff/);
    expect(JSON.stringify(img)).toMatch(/sandbox/);
  });
});
