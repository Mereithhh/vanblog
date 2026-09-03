import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { LinkMetaController } from '../src/controller/admin/link/link.meta.controller';
import { AccessGuard } from '../src/provider/access/access.guard';
import { TokenGuard } from '../src/provider/auth/token.guard';
import { ISRProvider } from '../src/provider/isr/isr.provider';
import { MetaProvider } from '../src/provider/meta/meta.provider';

/**
 * End-to-end of issue #252: a friend-link 伙伴名 that is a URL must
 * delete through the admin API, and editing it must update in place.
 */
function createMemoryMetaModel(links: any[] = []) {
  const state: any = { links: links.map((item) => ({ ...item })) };
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
    controllers: [LinkMetaController],
    providers: [
      { provide: MetaProvider, useValue: metaProvider },
      { provide: ISRProvider, useValue: { activeLink: jest.fn() } },
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
  return { app, metaProvider };
}

const urlLink = {
  name: 'https://testbug',
  url: 'https://example.com',
  desc: 'repro',
  logo: 'https://example.com/logo.png',
};

describe('friend link URL 伙伴名 (e2e #252)', () => {
  let app: INestApplication;
  let metaProvider: MetaProvider;

  beforeEach(async () => {
    const created = await createApp();
    app = created.app;
    metaProvider = created.metaProvider;
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a link named https://testbug and deletes it via query (admin client)', async () => {
    const server = app.getHttpServer();
    const created = await request(server).post('/api/admin/meta/link').send(urlLink);
    expect(created.body.statusCode).toBe(200);

    const listed = await request(server).get('/api/admin/meta/link');
    expect(listed.body.data.map((item: { name: string }) => item.name)).toEqual(['https://testbug']);

    const deleted = await request(server).delete(
      `/api/admin/meta/link?name=${encodeURIComponent('https://testbug')}`,
    );
    expect(deleted.status).toBe(200);
    expect(deleted.body.statusCode).toBe(200);
    expect(await metaProvider.getLinks()).toEqual([]);
  });

  it('deletes a URL-named link when the unencoded name is still in the path', async () => {
    const server = app.getHttpServer();
    await request(server).post('/api/admin/meta/link').send(urlLink);

    const deleted = await request(server).delete('/api/admin/meta/link/https://testbug');
    expect(deleted.status).toBe(200);
    expect(await metaProvider.getLinks()).toEqual([]);
  });

  it('edits a URL-named link in place without duplicating', async () => {
    const server = app.getHttpServer();
    await request(server).post('/api/admin/meta/link').send(urlLink);

    const updated = await request(server)
      .put('/api/admin/meta/link')
      .send({
        ...urlLink,
        name: 'Fixed Blog',
        desc: 'corrected',
        oldName: 'https://testbug',
      });
    expect(updated.status).toBe(200);

    const listed = await request(server).get('/api/admin/meta/link');
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.data[0].name).toBe('Fixed Blog');
    expect(listed.body.data[0].desc).toBe('corrected');
  });

  it('still creates, updates, and deletes a normal 伙伴名', async () => {
    const server = app.getHttpServer();
    const payload = {
      name: '伙伴博客',
      url: 'https://friend.example',
      desc: 'hello',
      logo: '/logo.png',
    };
    expect((await request(server).post('/api/admin/meta/link').send(payload)).body.statusCode).toBe(
      200,
    );

    const renamed = await request(server)
      .put('/api/admin/meta/link')
      .send({ ...payload, url: 'https://friend.example/new', oldName: '伙伴博客' });
    expect(renamed.status).toBe(200);

    const listed = await request(server).get('/api/admin/meta/link');
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.data[0].url).toBe('https://friend.example/new');

    const deleted = await request(server).delete(
      `/api/admin/meta/link/${encodeURIComponent('伙伴博客')}`,
    );
    expect(deleted.status).toBe(200);
    expect(await metaProvider.getLinks()).toEqual([]);
  });
});
