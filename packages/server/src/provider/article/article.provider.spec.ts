import { BadRequestException } from '@nestjs/common';
import { ArticleProvider } from './article.provider';

class CastError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CastError';
  }
}

function assertQueryId(id: unknown) {
  if (typeof id === 'number' && Number.isNaN(id)) {
    throw new CastError(
      'Cast to Number failed for value "NaN" (type number) at path "id" for model "Article"',
    );
  }
}

function createMemoryArticleModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => {
    if (query?.pathname != null) {
      return docs.find((item) => item.pathname === query.pathname) || null;
    }
    assertQueryId(query?.id);
    return docs.find((item) => item.id === query.id) || null;
  };
  return {
    docs,
    findOne: jest.fn((query: any) => ({
      exec: async () => findMatching(query),
    })),
    updateOne: jest.fn(async (query: any, patch: any) => {
      assertQueryId(query?.id);
      const target = findMatching(query);
      if (!target) {
        return { modifiedCount: 0 };
      }
      Object.assign(target, patch);
      return { modifiedCount: 1 };
    }),
  };
}

function createProvider(model: any) {
  return new ArticleProvider(model, {} as any, { updateTotalWords: jest.fn() } as any, {} as any);
}

describe('ArticleProvider getById/updateById (#427)', () => {
  const original = {
    id: 7,
    title: '文章',
    content: '<!-- more -->\n不要被 NaN 写空',
    pathname: 'hello-post',
    deleted: false,
  };

  it('round-trips a valid article', async () => {
    const model = createMemoryArticleModel([{ ...original }]);
    const provider = createProvider(model);

    const loaded = await provider.getById(7, 'admin');
    expect(loaded.content).toBe(original.content);
    await provider.updateById(7, { content: '<!-- more -->\n已保存' });
    expect(model.docs[0].content).toBe('<!-- more -->\n已保存');
  });

  it('does not CastError-query mongoose or wipe content when id is NaN', async () => {
    const model = createMemoryArticleModel([{ ...original }]);
    const provider = createProvider(model);

    await expect(provider.getById(NaN, 'admin')).rejects.toBeInstanceOf(BadRequestException);
    await expect(provider.getById(undefined as any, 'admin')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(provider.updateById(NaN, { content: '' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(provider.getByIdOrPathname('undefined', 'admin')).resolves.toBeNull();

    const idQueries = [...model.findOne.mock.calls, ...model.updateOne.mock.calls].filter(
      ([query]) => query && Object.prototype.hasOwnProperty.call(query, 'id'),
    );
    expect(idQueries).toEqual([]);
    expect(model.docs[0].content).toBe(original.content);
  });
});

function createPagedArticleModel() {
  const skipValues: number[] = [];
  const query: any = {
    sort: jest.fn().mockImplementation(() => query),
    skip: jest.fn().mockImplementation((n: number) => {
      skipValues.push(n);
      return query;
    }),
    limit: jest.fn().mockImplementation(() => query),
    exec: jest.fn().mockResolvedValue([]),
  };
  return {
    skipValues,
    find: jest.fn().mockReturnValue(query),
    count: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
  };
}

describe('ArticleProvider.create pathname (#383)', () => {
  it('persists a custom pathname the same way create-article does', async () => {
    const saved: any[] = [];
    const Model: any = function ArticleModel(this: any, dto: any) {
      Object.assign(this, dto);
      this.save = async () => {
        saved.push(this);
        return this;
      };
    };
    const provider = createProvider(Model);
    jest.spyOn(provider, 'getNewId').mockResolvedValue(42);

    const created = await provider.create({
      title: 'Hexo 迁移',
      category: '测试',
      pathname: 'cb933e30',
      content: 'from archives/cb933e30.html',
    } as any);

    expect(created.id).toBe(42);
    expect(created.pathname).toBe('cb933e30');
    expect(saved).toHaveLength(1);
    expect(saved[0].pathname).toBe('cb933e30');
  });
});

describe('ArticleProvider.getByOption pagination (#400)', () => {
  it('never calls Mongo skip with a negative or non-finite value', async () => {
    const hostile = [
      { page: NaN, pageSize: 10 },
      { page: 0, pageSize: 10 },
      { page: -3, pageSize: 10 },
      { page: undefined as any, pageSize: 5 },
      { page: Number.MAX_VALUE, pageSize: 10 },
      { page: '-9223372036854775808' as any, pageSize: 10 },
      { page: 1, pageSize: NaN },
    ];
    for (const option of hostile) {
      const model = createPagedArticleModel();
      const provider = createProvider(model);
      await provider.getByOption({ ...option, regMatch: false } as any, false);
      expect(model.skipValues.length).toBeGreaterThan(0);
      for (const skip of model.skipValues) {
        expect(Number.isFinite(skip)).toBe(true);
        expect(skip).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('ArticleProvider cover (#288)', () => {
  it('includes cover in public, admin, and list projections', () => {
    const provider = createProvider(createMemoryArticleModel());
    expect(provider.publicView.cover).toBe(1);
    expect(provider.adminView.cover).toBe(1);
    expect(provider.listView.cover).toBe(1);
  });

  it('saves and clears cover via updateById', async () => {
    const model = createMemoryArticleModel([
      {
        id: 7,
        title: '文章',
        content: '正文',
        pathname: 'hello-post',
        deleted: false,
      },
    ]);
    const provider = createProvider(model);

    await provider.updateById(7, { cover: '/static/img/hero.webp' });
    expect(model.docs[0].cover).toBe('/static/img/hero.webp');

    await provider.updateById(7, { cover: '' });
    expect(model.docs[0].cover).toBe('');
  });
});
