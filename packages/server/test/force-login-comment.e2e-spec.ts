import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { SettingProvider } from '../src/provider/setting/setting.provider';
import { WalineProvider } from '../src/provider/waline/waline.provider';
import { authorizeCommentPost } from '../src/utils/walineLogin';

/**
 * End-to-end of #446: enabling「强制登录后评论」must persist, map to
 * Waline LOGIN=force, reject anonymous POST /comment, and still allow
 * a logged-in Waline user to comment.
 */
function createMemorySettingModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => docs.find((item) => item.type === query?.type) || null;
  return {
    docs,
    findOne: jest.fn((query: any) => ({
      exec: async () => findMatching(query),
    })),
    create: jest.fn(async (doc: any) => {
      const created = { ...doc };
      docs.push(created);
      return created;
    }),
    updateOne: jest.fn(async (query: any, patch: any) => {
      const target = findMatching(query);
      if (target) {
        Object.assign(target, patch);
      }
      return { acknowledged: true, matchedCount: target ? 1 : 0, modifiedCount: target ? 1 : 0 };
    }),
  };
}

function readUserInfo(req: { headers: Record<string, string | string[] | undefined> }) {
  const raw = req.headers.authorization;
  const token = Array.isArray(raw) ? raw[0] : raw;
  if (token === 'Bearer waline-user') {
    return { objectId: 'user-1', type: 'guest' };
  }
  return null;
}

async function listen(server: ReturnType<typeof createServer>) {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    port,
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

async function postComment(baseUrl: string, body: any, token?: string) {
  const res = await fetch(`${baseUrl}/comment`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

describe('force login comments (e2e)', () => {
  it('anonymous submit is rejected and logged-in user can comment', async () => {
    const model = createMemorySettingModel();
    const settingProvider = new SettingProvider(model as any, {} as any, {} as any);
    const walineProvider = new WalineProvider({} as any, settingProvider);

    await settingProvider.updateWalineSetting({ forceLoginComment: true } as any);
    const saved = await settingProvider.getWalineSetting();
    expect(saved.forceLoginComment).toBe(true);
    expect(walineProvider.mapConfig2Env(saved).LOGIN).toBe('force');

    const server = createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/comment') {
        const setting = await settingProvider.getWalineSetting();
        const auth = authorizeCommentPost({
          forceLoginComment: setting.forceLoginComment,
          userInfo: readUserInfo(req),
        });
        if (!auth.ok) {
          res.writeHead(401, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ errno: 401, errmsg: 'Login required' }));
          return;
        }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ errno: 0, data: { comment: 'ok', nick: 'tester' } }));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    const http = await listen(server);
    try {
      const guest = await postComment(http.url, {
        nick: 'anon',
        mail: 'anon@example.com',
        comment: 'anonymous reply',
        url: '/post/1',
      });
      expect(guest.status).toBe(401);

      const user = await postComment(
        http.url,
        {
          nick: 'alice',
          mail: 'alice@example.com',
          comment: 'logged-in reply',
          url: '/post/1',
        },
        'waline-user',
      );
      expect(user.status).toBe(200);
      expect(user.json.errno).toBe(0);
    } finally {
      await http.close();
    }
  });

  it('anonymous submit still works after the toggle is turned off', async () => {
    const model = createMemorySettingModel();
    const settingProvider = new SettingProvider(model as any, {} as any, {} as any);
    const walineProvider = new WalineProvider({} as any, settingProvider);

    await settingProvider.updateWalineSetting({ forceLoginComment: true } as any);
    await settingProvider.updateWalineSetting({ forceLoginComment: false } as any);
    const saved = await settingProvider.getWalineSetting();
    expect(saved.forceLoginComment).toBe(false);
    expect(walineProvider.mapConfig2Env(saved).LOGIN).toBeUndefined();

    const server = createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/comment') {
        const setting = await settingProvider.getWalineSetting();
        const auth = authorizeCommentPost({
          forceLoginComment: setting.forceLoginComment,
          userInfo: readUserInfo(req),
        });
        if (!auth.ok) {
          res.writeHead(401, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ errno: 401 }));
          return;
        }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ errno: 0 }));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    const http = await listen(server);
    try {
      const guest = await postComment(http.url, {
        nick: 'anon',
        mail: 'anon@example.com',
        comment: 'still allowed',
        url: '/post/1',
      });
      expect(guest.status).toBe(200);
    } finally {
      await http.close();
    }
  });
});
