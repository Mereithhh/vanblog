import { BadRequestException, NotFoundException } from '@nestjs/common';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { config } from 'src/config';
import {
  assertArticleHasPassword,
  decideArticleUnlock,
  presentPublicArticle,
} from 'src/utils/articleAccess';
import { RssProvider } from '../rss/rss.provider';
import { ArticleProvider } from './article.provider';

const SECRET = 'full-private-body-do-not-leak';
const PASSWORD = 'correct-horse';

function createArticleModel(docs: any[]) {
  const query: any = {
    sort() {
      return query;
    },
    skip() {
      return query;
    },
    limit() {
      return Promise.resolve([]);
    },
    exec: async () => docs.filter((item) => item.deleted !== true),
  };
  return {
    docs,
    findOne: (filter: any) => ({
      exec: async () => {
        const matched = docs.find((item) => {
          if (item.deleted === true) {
            return false;
          }
          if (filter?.pathname != null) {
            return item.pathname === filter.pathname;
          }
          if (filter?.id != null) {
            return item.id === filter.id;
          }
          return false;
        });
        return matched || null;
      },
    }),
    find: () => query,
    count: () => ({ exec: async () => docs.length }),
  };
}

function createCategoryModel(categories: any[]) {
  return {
    findOne: async (filter: any) => categories.find((item) => item.name === filter?.name) || null,
    find: async (filter: any) => {
      const names: string[] | undefined = filter?.name?.$in;
      if (!names) {
        return categories;
      }
      return categories.filter((item) => names.includes(item.name));
    },
  };
}

function createProvider(articles: any[], categories: any[] = [], siteInfo: any = {}) {
  const metaProvider = {
    getSiteInfo: jest.fn().mockResolvedValue(siteInfo),
    updateTotalWords: jest.fn(),
  };
  const provider = new ArticleProvider(
    createArticleModel(articles) as any,
    createCategoryModel(categories) as any,
    metaProvider as any,
    {} as any,
  );
  return { provider, metaProvider };
}

function article(partial: any) {
  return {
    id: 12,
    title: 'locked-title',
    content: SECRET,
    password: '',
    private: false,
    hidden: false,
    category: '随笔',
    tags: ['note'],
    pathname: 'locked-post',
    deleted: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-03'),
    ...partial,
  };
}

describe('decideArticleUnlock', () => {
  it('denies a protected article whose effective password is empty', () => {
    expect(
      decideArticleUnlock({
        article: { private: true, password: '' },
        category: null,
        submittedPassword: 'x',
      }),
    ).toBe('deny');
    expect(
      decideArticleUnlock({
        article: { private: false, password: '' },
        category: { private: true, password: '   ' },
        submittedPassword: 'x',
      }),
    ).toBe('deny');
  });

  it('allows the matching password and rejects a different one', () => {
    expect(
      decideArticleUnlock({
        article: { private: true, password: PASSWORD },
        submittedPassword: PASSWORD,
      }),
    ).toBe('allow');
    expect(
      decideArticleUnlock({
        article: { private: true, password: PASSWORD },
        submittedPassword: 'nope',
      }),
    ).toBe('deny');
  });

  it('blocks hidden articles unless open-by-url is enabled', () => {
    expect(
      decideArticleUnlock({
        article: { hidden: true, private: false, password: '' },
        submittedPassword: 'x',
      }),
    ).toBe('hidden');
    expect(
      decideArticleUnlock({
        article: { hidden: true, private: true, password: PASSWORD },
        submittedPassword: PASSWORD,
        allowOpenHiddenPostByUrl: 'true',
      }),
    ).toBe('allow');
  });
});

describe('ArticleProvider.getByIdWithPassword', () => {
  it('does not unlock a private article that has no password', async () => {
    const { provider } = createProvider([article({ private: true, password: '' })]);
    const result = await provider.getByIdWithPassword(12, 'x');
    expect(result).toBeNull();
    await expect(provider.getByIdWithPassword('locked-post', 'anything')).resolves.toBeNull();
  });

  it('does not unlock a private category when neither password is set', async () => {
    const { provider } = createProvider(
      [article({ private: false, password: '' })],
      [{ name: '随笔', private: true, password: '' }],
    );
    expect(await provider.getByIdWithPassword(12, 'x')).toBeNull();
  });

  it('returns the body for the correct password and omits the stored password', async () => {
    const { provider } = createProvider([article({ private: true, password: PASSWORD })]);
    const unlocked = await provider.getByIdWithPassword(12, PASSWORD);
    expect(unlocked.content).toBe(SECRET);
    expect(unlocked.private).toBe(true);
    expect(unlocked.password).toBeUndefined();
    expect('password' in unlocked).toBe(false);
    expect(JSON.stringify(unlocked)).not.toContain(PASSWORD);
    expect(await provider.getByIdWithPassword(12, 'wrong')).toBeNull();
    expect(await provider.getByIdWithPassword(12, '')).toBeNull();
  });

  it('uses the category password when the category is private', async () => {
    const { provider } = createProvider(
      [article({ private: true, password: 'article-pw' })],
      [{ name: '随笔', private: true, password: 'category-pw' }],
    );
    const unlocked = await provider.getByIdWithPassword('locked-post', 'category-pw');
    expect(unlocked.content).toBe(SECRET);
    expect(JSON.stringify(unlocked)).not.toContain('category-pw');
    expect(JSON.stringify(unlocked)).not.toContain('article-pw');
    expect(await provider.getByIdWithPassword(12, 'article-pw')).toBeNull();
  });

  it('falls back to the article password when a private category has none', async () => {
    const { provider } = createProvider(
      [article({ private: true, password: PASSWORD })],
      [{ name: '随笔', private: true, password: '' }],
    );
    const unlocked = await provider.getByIdWithPassword(12, PASSWORD);
    expect(unlocked.content).toBe(SECRET);
    expect(await provider.getByIdWithPassword(12, 'x')).toBeNull();
  });

  it('still returns a public article and keeps a leftover password gated', async () => {
    const open = createProvider([article({ private: false, password: '' })]);
    expect((await open.provider.getByIdWithPassword(12, 'x')).content).toBe(SECRET);

    const leftover = createProvider([article({ private: false, password: PASSWORD })]);
    expect((await leftover.provider.getByIdWithPassword(12, PASSWORD)).content).toBe(SECRET);
    expect(await leftover.provider.getByIdWithPassword(12, 'x')).toBeNull();
  });

  it('hides hidden articles unless allowOpenHiddenPostByUrl is enabled', async () => {
    const blocked = createProvider(
      [article({ hidden: true, private: true, password: PASSWORD })],
      [],
      { allowOpenHiddenPostByUrl: 'false' },
    );
    await expect(blocked.provider.getByIdWithPassword(12, PASSWORD)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(blocked.provider.getByIdWithPassword(12, PASSWORD)).rejects.toThrow(
      '该文章是隐藏文章！',
    );

    const defaultOff = createProvider([article({ hidden: true, password: '' })]);
    await expect(defaultOff.provider.getByIdWithPassword(12, 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    const opened = createProvider(
      [article({ hidden: true, private: true, password: PASSWORD })],
      [],
      { allowOpenHiddenPostByUrl: 'true' },
    );
    expect((await opened.provider.getByIdWithPassword(12, PASSWORD)).content).toBe(SECRET);
    expect(await opened.provider.getByIdWithPassword(12, 'nope')).toBeNull();

    const hiddenUnlockedButEmpty = createProvider(
      [article({ hidden: true, private: true, password: '' })],
      [],
      { allowOpenHiddenPostByUrl: 'true' },
    );
    expect(await hiddenUnlockedButEmpty.provider.getByIdWithPassword(12, 'x')).toBeNull();
  });

  it('returns null when the article does not exist', async () => {
    const { provider } = createProvider([]);
    expect(await provider.getByIdWithPassword(99, 'x')).toBeNull();
  });
});

describe('ArticleProvider public reads omit locked content', () => {
  it('strips locked bodies on the GET article path and on pre/next', async () => {
    const { provider } = createProvider(
      [
        article({ id: 1, private: true, password: PASSWORD, pathname: 'one' }),
        article({
          id: 2,
          title: 'next',
          content: 'next-body',
          password: PASSWORD,
          private: false,
          pathname: 'two',
          category: '日记',
        }),
      ],
      [{ name: '日记', private: true, password: 'cat' }],
    );
    const own = await provider.getByIdOrPathnameWithPreNext(1, 'public');
    expect(own.article.content).toBeUndefined();
    expect('content' in own.article).toBe(false);
    expect(own.article.password).toBeUndefined();
    expect(JSON.stringify(own)).not.toContain(SECRET);
    expect(JSON.stringify(own)).not.toContain(PASSWORD);

    const byCategory = await provider.getByIdOrPathnameWithPreNext(2, 'public');
    expect(byCategory.article.private).toBe(true);
    expect('content' in byCategory.article).toBe(false);
    expect(JSON.stringify(byCategory)).not.toContain('next-body');
  });

  it('returns a normal article and 404s a hidden article the same way as before', async () => {
    const { provider } = createProvider([
      article({ id: 3, private: false, password: '', hidden: false, content: 'visible' }),
      article({ id: 4, hidden: true, content: SECRET, pathname: 'hidden-one' }),
    ]);
    const visible = await provider.getByIdOrPathnameWithPreNext(3, 'public');
    expect(visible.article.content).toBe('visible');

    await expect(provider.getByIdOrPathnameWithPreNext(4, 'public')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('strips private and category-private bodies from the public list', async () => {
    const { provider } = createProvider(
      [
        article({ id: 1, private: true, password: PASSWORD, category: '随笔' }),
        article({ id: 2, private: false, password: '', category: '日记', content: 'cat-secret' }),
        article({ id: 3, private: false, password: '', category: '公开', content: 'hello-public' }),
      ],
      [
        { name: '随笔', private: false, password: '' },
        { name: '日记', private: true, password: 'cat' },
        { name: '公开', private: false, password: '' },
      ],
    );
    const listed = await provider.getByOption(
      { page: 1, pageSize: 10, regMatch: false } as any,
      true,
    );
    const encoded = JSON.stringify(listed);
    expect(encoded).not.toContain(SECRET);
    expect(encoded).not.toContain('cat-secret');
    expect(encoded).not.toContain(PASSWORD);
    expect(encoded).toContain('hello-public');
    const locked = listed.articles.find((item) => item.id === 1);
    expect(locked.private).toBe(true);
    expect('content' in locked).toBe(false);
  });

  it('does not reveal locked bodies through public search, including content-only hits', async () => {
    const { provider } = createProvider(
      [
        article({
          id: 1,
          title: 'ordinary title',
          content: 'unique-secret-phrase',
          private: true,
          password: PASSWORD,
        }),
        article({
          id: 2,
          title: 'unique-secret-phrase in the title',
          content: SECRET,
          private: true,
          password: PASSWORD,
          pathname: 'titled',
        }),
        article({
          id: 3,
          title: 'public title',
          content: 'public-body-ok',
          private: false,
          category: '公开',
        }),
      ],
      [{ name: '随笔', private: false }],
    );

    const contentHit = await provider.searchByString('unique-secret-phrase', false);
    expect(contentHit.map((item) => item.id)).toEqual([2]);
    expect(JSON.stringify(contentHit)).not.toContain(SECRET);
    expect(contentHit[0].title).toContain('unique-secret-phrase');
    expect('content' in contentHit[0]).toBe(false);
    expect('password' in contentHit[0]).toBe(false);

    const publicHit = await provider.searchByString('public-body-ok', false);
    expect(publicHit.map((item) => item.id)).toEqual([3]);
    expect('content' in publicHit[0]).toBe(false);
  });

  it('redacts category-private articles for RSS', async () => {
    const { provider } = createProvider(
      [
        article({ id: 1, private: true, content: SECRET }),
        article({ id: 2, private: false, category: '日记', content: 'category-secret' }),
        article({ id: 3, private: false, category: '公开', content: 'rss-public' }),
      ],
      [
        { name: '随笔', private: false },
        { name: '日记', private: true, password: 'cat' },
        { name: '公开', private: false },
      ],
    );
    const feed = await provider.redactLockedPublicContent([
      article({ id: 1, private: true, content: SECRET, password: PASSWORD }),
      article({ id: 2, private: false, category: '日记', content: 'category-secret', password: 'x' }),
      article({ id: 3, private: false, category: '公开', content: 'rss-public', password: '' }),
    ]);
    expect(feed[0].content).toBe('此文章已加密');
    expect(feed[1].content).toBe('此文章已加密');
    expect(feed[1].private).toBe(true);
    expect(feed[2].content).toBe('rss-public');
    expect(JSON.stringify(feed)).not.toContain(SECRET);
    expect(JSON.stringify(feed)).not.toContain('category-secret');
    expect(JSON.stringify(feed)).not.toContain(PASSWORD);
  });
});

describe('assertArticleHasPassword', () => {
  it('rejects a private save with an empty password and keeps unrelated edits', () => {
    expect(() => assertArticleHasPassword({ private: true, password: '' }, null)).toThrow(
      BadRequestException,
    );
    expect(() => assertArticleHasPassword({ private: true }, { password: '' })).toThrow(
      '如若加密，请填写密码！',
    );
    expect(() => assertArticleHasPassword({ password: '   ' }, { private: true, password: PASSWORD })).toThrow(
      BadRequestException,
    );
    expect(() =>
      assertArticleHasPassword({ content: 'edit' } as { private?: unknown; password?: unknown }, {
        private: true,
        password: '',
      }),
    ).not.toThrow();
    expect(() =>
      assertArticleHasPassword({ private: true }, { private: false, password: PASSWORD }),
    ).not.toThrow();
    expect(() => assertArticleHasPassword({ private: true, password: PASSWORD }, null)).not.toThrow();
  });
});

describe('presentPublicArticle', () => {
  it('drops content and password for protected articles only', () => {
    const locked = presentPublicArticle(
      { title: 't', content: SECRET, password: PASSWORD, private: true },
      null,
    );
    expect(locked.content).toBeUndefined();
    expect(locked.password).toBeUndefined();
    const open = presentPublicArticle(
      { title: 't', content: 'ok', password: '', private: false },
      { private: false },
    );
    expect(open.content).toBe('ok');
    expect(open.password).toBeUndefined();
  });
});

describe('RssProvider locked articles', () => {
  const prevStatic = config.staticPath;

  afterEach(() => {
    config.staticPath = prevStatic;
  });

  it('writes the redacted body, not the original private or category-private text', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-rss-'));
    config.staticPath = dir;
    const articleProvider = {
      getAll: jest.fn().mockResolvedValue([
        article({ content: SECRET, private: true }),
        article({ id: 2, category: '日记', content: 'category-secret', private: false }),
      ]),
      redactLockedPublicContent: jest.fn(async (items: any[]) =>
        items.map((item) => ({ ...item, content: '此文章已加密', private: true, password: undefined })),
      ),
    };
    const provider = new RssProvider(
      articleProvider as any,
      {
        getAll: async () => ({
          siteInfo: {
            author: 'author',
            baseUrl: 'https://example.com/',
            siteName: 'site',
            siteDesc: 'desc',
          },
        }),
      } as any,
      { getWalineSetting: async () => ({}) } as any,
      {
        renderMarkdown: (value: string) => value,
        getDescription: (value: string) => value,
      } as any,
    );

    try {
      await provider.generateRssFeedFn('test');
      const xmlPath = path.join(dir, 'rss', 'feed.xml');
      expect(fs.existsSync(xmlPath)).toBe(true);
      const xml = fs.readFileSync(xmlPath, 'utf8');
      expect(articleProvider.redactLockedPublicContent).toHaveBeenCalled();
      expect(xml).toContain('此文章已加密');
      expect(xml).not.toContain(SECRET);
      expect(xml).not.toContain('category-secret');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
