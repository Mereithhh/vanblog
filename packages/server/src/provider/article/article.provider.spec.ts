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
