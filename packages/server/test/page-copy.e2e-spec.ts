import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { SiteMetaController } from '../src/controller/admin/site/site.meta.controller';
import { AccessGuard } from '../src/provider/access/access.guard';
import { TokenGuard } from '../src/provider/auth/token.guard';
import { ISRProvider } from '../src/provider/isr/isr.provider';
import { MetaProvider } from '../src/provider/meta/meta.provider';
import { PipelineProvider } from '../src/provider/pipeline/pipeline.provider';
import { WalineProvider } from '../src/provider/waline/waline.provider';
import { WebsiteProvider } from '../src/provider/website/website.provider';
import { DEFAULT_FRIEND_LINK_INTRO, resolvePageCopy } from '../src/utils/pageCopy';

/**
 * End-to-end of issue #373: friend-link / about page copy is stored on
 * site settings and empty values fall back to the previous hardcoded text.
 */
function createMemoryMetaModel() {
  const state: any = { siteInfo: { siteName: 'demo', baseUrl: 'https://blog.example.com' } };
  return {
    state,
    findOne: jest.fn(() => ({
      exec: async () => state,
    })),
    updateOne: jest.fn(async (_query: any, patch: any) => {
      Object.assign(state, patch);
      return { acknowledged: true, modifiedCount: 1 };
    }),
  };
}

async function createApp() {
  const model = createMemoryMetaModel();
  const metaProvider = new MetaProvider(model as any, {} as any, {} as any, {} as any, {} as any);
  const allow = { canActivate: () => true };
  const moduleRef = await Test.createTestingModule({
    controllers: [SiteMetaController],
    providers: [
      { provide: MetaProvider, useValue: metaProvider },
      { provide: ISRProvider, useValue: { activeAll: jest.fn() } },
      { provide: WalineProvider, useValue: { restart: jest.fn() } },
      { provide: WebsiteProvider, useValue: { restart: jest.fn() } },
      { provide: PipelineProvider, useValue: { dispatchEvent: jest.fn() } },
    ],
  })
    .overrideGuard(AuthGuard('jwt'))
    .useValue(allow)
    .overrideGuard(TokenGuard)
    .useValue(allow)
    .overrideGuard(AccessGuard)
    .useValue(allow)
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return { app, metaProvider, model };
}

describe('site page copy (e2e #373)', () => {
  let app: INestApplication;

  afterEach(async () => {
    await app.close();
  });

  it('persists custom friend-link and about copy through admin site settings', async () => {
    const created = await createApp();
    app = created.app;
    const server = app.getHttpServer();

    const updated = await request(server).put('/api/admin/meta/site').send({
      siteName: 'demo',
      friendLinkIntro: '这些是朋友们的站点：',
      friendLinkApplyContent: '请先留言。名称：{{siteName}}',
      aboutTitle: 'About this blog',
    });
    expect(updated.body.statusCode).toBe(200);

    const stored = await request(server).get('/api/admin/meta/site');
    expect(stored.body.statusCode).toBe(200);
    expect(stored.body.data.friendLinkIntro).toBe('这些是朋友们的站点：');
    expect(stored.body.data.friendLinkApplyContent).toBe('请先留言。名称：{{siteName}}');
    expect(stored.body.data.aboutTitle).toBe('About this blog');
  });

  it('empty copy falls back to the previous hardcoded friend-link intro', async () => {
    const created = await createApp();
    app = created.app;
    const server = app.getHttpServer();

    await request(server).put('/api/admin/meta/site').send({
      siteName: 'demo',
      friendLinkIntro: '',
      friendLinkApplyContent: '  ',
      aboutTitle: '',
    });
    const stored = await request(server).get('/api/admin/meta/site');
    expect(stored.body.data.friendLinkIntro).toBe('');
    expect(resolvePageCopy(stored.body.data.friendLinkIntro, DEFAULT_FRIEND_LINK_INTRO)).toBe(
      DEFAULT_FRIEND_LINK_INTRO,
    );
    expect(resolvePageCopy(stored.body.data.aboutTitle, '关于我')).toBe('关于我');
  });
});
