import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import request from 'supertest';
import { config } from 'src/config';
import { AccessGuard } from 'src/provider/access/access.guard';
import { ArticleProvider } from 'src/provider/article/article.provider';
import { TokenGuard } from 'src/provider/auth/token.guard';
import { DraftProvider } from 'src/provider/draft/draft.provider';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { LocalProvider } from 'src/provider/static/local.provider';
import { StaticProvider } from 'src/provider/static/static.provider';
import { applyStaticAssetHeaders } from 'src/utils/imgCompress';
import { guardUploadStatic } from 'src/utils/staticServe';
import { ImgController } from './img.controller';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function truncatedGif(): Buffer {
  return Buffer.concat([
    Buffer.from('GIF89a'),
    Buffer.from([0x01, 0x00, 0x01, 0x00]),
    Buffer.from('<html><body>marker-html</body></html>'),
  ]);
}

const limitedCollaborator = {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 4, name: 'writer', permissions: ['article:create'] };
    return true;
  },
};

describe('collaborator image upload', () => {
  let tmp: string;
  let prevStatic: string;
  let app: NestExpressApplication;

  beforeAll(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-img-http-'));
    prevStatic = config.staticPath;
    config.staticPath = tmp;
    fs.mkdirSync(path.join(tmp, 'img'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'tmp'), { recursive: true });

    const staticModel = {
      findOne: jest.fn(() => ({
        exec: async () => null,
      })),
    };
    const settingProvider = {
      getStaticSetting: async () => ({
        enableWebp: true,
        storageType: 'local',
        enableWaterMark: false,
      }),
    };
    const localProvider = new LocalProvider();
    const staticProvider = new StaticProvider(
      staticModel as any,
      settingProvider as any,
      localProvider,
      {} as any,
      {} as any,
    );
    (staticProvider as any).createInDB = async (dto: any) => dto;

    const moduleRef = await Test.createTestingModule({
      controllers: [ImgController],
      providers: [
        { provide: StaticProvider, useValue: staticProvider },
        { provide: ArticleProvider, useValue: {} },
        { provide: DraftProvider, useValue: {} },
        { provide: ISRProvider, useValue: {} },
        { provide: MetaProvider, useValue: {} },
        AccessGuard,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(limitedCollaborator)
      .overrideGuard(TokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.use(guardUploadStatic);
    app.useStaticAssets(tmp, {
      prefix: '/static/',
      setHeaders: applyStaticAssetHeaders,
    });
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    config.staticPath = prevStatic;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('rejects a short GIF header named .html and does not publish it', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/img/upload')
      .attach('file', truncatedGif(), { filename: 'proof.html', contentType: 'text/html' });

    expect(res.status).toBe(400);
    const names = fs.readdirSync(path.join(tmp, 'img'));
    expect(names.some((name) => name.endsWith('.html') || name.includes('.html'))).toBe(false);

    const fetched = await request(app.getHttpServer()).get('/static/img/proof.html');
    expect(fetched.status).toBe(404);
    expect(String(fetched.headers['content-type'] || '')).not.toMatch(/text\/html/);
    expect(fetched.text).not.toContain('marker-html');
    expect(fetched.headers['x-content-type-options']).toBe('nosniff');
  });

  it('still accepts a normal png and serves the compressed image', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/img/upload')
      .attach('file', PNG_1X1, { filename: 'photo.png', contentType: 'image/png' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.data.src).toMatch(/\/static\/img\/.+\.photo\.webp$/);
    expect(res.body.data.isNew).toBe(true);

    const fetched = await request(app.getHttpServer()).get(res.body.data.src).expect(200);
    expect(fetched.headers['content-type']).toMatch(/image\/webp/);
    expect(fetched.headers['x-content-type-options']).toBe('nosniff');
    expect(String(fetched.headers['content-security-policy'] || '')).toMatch(/sandbox/);
    expect(fetched.body.slice(0, 4).toString()).toBe('RIFF');
    expect(fetched.body.slice(8, 12).toString()).toBe('WEBP');
    expect(fetched.body.toString('utf8').includes('marker-html')).toBe(false);
  });
});
