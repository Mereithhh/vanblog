import { BadRequestException } from '@nestjs/common';
import { ArticleProvider } from './article.provider';

function matchesMongoQuery(doc: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) {
    return true;
  }
  if (query.$and) {
    return query.$and.every((part: any) => matchesMongoQuery(doc, part));
  }
  if (query.$or) {
    return query.$or.some((part: any) => matchesMongoQuery(doc, part));
  }
  for (const [key, value] of Object.entries(query)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && '$exists' in (value as any)) {
      const exists = doc[key] !== undefined;
      if ((value as any).$exists !== exists) {
        return false;
      }
      continue;
    }
    if (doc[key] !== value) {
      return false;
    }
  }
  return true;
}

function createMemoryArticleModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  return {
    docs,
    find: jest.fn(async (query: any) => docs.filter((item) => matchesMongoQuery(item, query))),
    updateOne: jest.fn(async (query: any, patch: any) => {
      const target = docs.find((item) => item.id === query.id);
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

describe('ArticleProvider.rewriteBaseUrl (#475)', () => {
  const live = {
    id: 1,
    title: '旧域名图片',
    content:
      '![a](https://old.example.com/static/img/a.webp)\nkeep https://cdn.other.com/x.png\n<img src="https://old.example.com/static/img/b.png">',
    deleted: false,
  };
  const relative = {
    id: 2,
    title: '相对路径',
    content: '![](/static/img/local.webp)',
    deleted: false,
  };
  const deleted = {
    id: 3,
    title: '已删除',
    content: '![](https://old.example.com/static/img/gone.webp)',
    deleted: true,
  };

  it('rewrites matching article content and counts updates', async () => {
    const model = createMemoryArticleModel([{ ...live }, { ...relative }, { ...deleted }]);
    const provider = createProvider(model);

    const result = await provider.rewriteBaseUrl(
      'https://old.example.com/',
      'https://new.example.com',
    );

    expect(result).toEqual({ updated: 1, replacements: 2 });
    expect(model.docs[0].content).toContain('https://new.example.com/static/img/a.webp');
    expect(model.docs[0].content).toContain('src="https://new.example.com/static/img/b.png"');
    expect(model.docs[0].content).toContain('https://cdn.other.com/x.png');
    expect(model.docs[1].content).toBe(relative.content);
    expect(model.docs[2].content).toBe(deleted.content);
    expect(model.updateOne).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when old equals new or either is missing', async () => {
    const model = createMemoryArticleModel([{ ...live }]);
    const provider = createProvider(model);

    await expect(provider.rewriteBaseUrl('https://old.example.com', 'https://old.example.com/')).resolves.toEqual({
      updated: 0,
      replacements: 0,
    });
    await expect(provider.rewriteBaseUrl('', 'https://new.example.com')).resolves.toEqual({
      updated: 0,
      replacements: 0,
    });
    await expect(provider.rewriteBaseUrl('https://old.example.com', undefined as any)).resolves.toEqual({
      updated: 0,
      replacements: 0,
    });
    expect(model.docs[0].content).toBe(live.content);
    expect(model.find).not.toHaveBeenCalled();
    expect(model.updateOne).not.toHaveBeenCalled();
  });

  it('rejects a non-empty value that is not an http(s) URL', async () => {
    const model = createMemoryArticleModel([{ ...live }]);
    const provider = createProvider(model);
    await expect(provider.rewriteBaseUrl('old.example.com', 'https://new.example.com')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(model.docs[0].content).toBe(live.content);
  });
});
