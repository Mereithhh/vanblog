import {
  Controller,
  Get,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  Post,
  RequestMethod,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { NoStoreCacheMiddleware } from '../src/provider/cache/no-store.middleware';
import {
  CDN_NO_STORE,
  NO_STORE_CACHE_CONTROL,
  hasNoStoreCachePolicy,
} from '../src/utils/cacheControl';

/**
 * End-to-end of issue #140: origin must tell CDNs not to store /admin
 * and /api/admin/* even when a "cache everything" rule is in front.
 */
@Controller()
class ProbeController {
  @Get('/api/admin/meta')
  adminMeta() {
    return { statusCode: 200, data: { ok: true } };
  }

  @Post('/api/admin/auth/login')
  login() {
    return { statusCode: 200, data: { token: 't' } };
  }

  @Get('/api/admin/secret')
  secret() {
    throw new UnauthorizedException({ statusCode: 401, message: '未登录' });
  }

  @Get('/admin')
  adminShell() {
    return '<html>admin</html>';
  }

  @Get('/admin/user/login')
  adminLoginPage() {
    return '<html>login</html>';
  }

  @Get('/api/public/article/1')
  publicArticle() {
    return { statusCode: 200, data: { title: 'hello' } };
  }

  @Get('/_next/static/chunks/main.js')
  publicAsset() {
    return 'console.log(1)';
  }

  @Get('/')
  home() {
    return 'Hello World!';
  }
}

@Module({ controllers: [ProbeController] })
class ProbeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(NoStoreCacheMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}

function expectNoStore(res: request.Response) {
  expect(res.headers['cache-control']).toBe(NO_STORE_CACHE_CONTROL);
  expect(res.headers['cdn-cache-control']).toBe(CDN_NO_STORE);
  expect(res.headers['cloudflare-cdn-cache-control']).toBe(CDN_NO_STORE);
  expect(res.headers['pragma']).toBe('no-cache');
  expect(res.headers['expires']).toBe('0');
  expect(hasNoStoreCachePolicy(res.headers)).toBe(true);
}

function expectNotForcedNoStore(res: request.Response) {
  const cacheControl = String(res.headers['cache-control'] || '');
  const cdn = String(res.headers['cdn-cache-control'] || '');
  const cf = String(res.headers['cloudflare-cdn-cache-control'] || '');
  expect(cacheControl).not.toMatch(/no-store/i);
  expect(cdn).not.toMatch(/no-store/i);
  expect(cf).not.toMatch(/no-store/i);
  expect(hasNoStoreCachePolicy(res.headers)).toBe(false);
}

describe('admin / admin-API cache headers (e2e #140)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProbeModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /admin HTML shell is private no-store', async () => {
    const res = await request(app.getHttpServer()).get('/admin').expect(200);
    expectNoStore(res);
  });

  it('GET /admin/user/login is private no-store', async () => {
    const res = await request(app.getHttpServer()).get('/admin/user/login').expect(200);
    expectNoStore(res);
  });

  it('GET /api/admin/meta JSON is private no-store', async () => {
    const res = await request(app.getHttpServer()).get('/api/admin/meta').expect(200);
    expect(res.body.data.ok).toBe(true);
    expectNoStore(res);
  });

  it('POST /api/admin/auth/login is private no-store', async () => {
    const res = await request(app.getHttpServer()).post('/api/admin/auth/login');
    expect([200, 201]).toContain(res.status);
    expectNoStore(res);
  });

  it('401 admin API responses are still no-store so CDNs cannot store auth errors', async () => {
    const res = await request(app.getHttpServer()).get('/api/admin/secret').expect(401);
    expectNoStore(res);
  });

  it('public article API is not forced into the admin no-store policy', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/public/article/1')
      .expect(200);
    expect(res.body.data.title).toBe('hello');
    expectNotForcedNoStore(res);
  });

  it('public homepage is not forced into the admin no-store policy', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.text).toBe('Hello World!');
    expectNotForcedNoStore(res);
  });

  it('public Next.js static assets are not forced into no-store', async () => {
    const res = await request(app.getHttpServer())
      .get('/_next/static/chunks/main.js')
      .expect(200);
    expectNotForcedNoStore(res);
  });
});
