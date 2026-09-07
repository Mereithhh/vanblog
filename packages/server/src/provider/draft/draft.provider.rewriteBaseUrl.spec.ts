import { BadRequestException } from '@nestjs/common';
import { DraftProvider } from './draft.provider';

function matchesMongoQuery(doc: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) {
    return true;
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

function createMemoryDraftModel(initial: any[] = []) {
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

describe('DraftProvider.rewriteBaseUrl (#475)', () => {
  const live = {
    id: 11,
    title: '草稿里的旧图',
    content: '![d](https://old.example.com/static/img/draft.webp)',
    deleted: false,
  };
  const deleted = {
    id: 12,
    title: '已删草稿',
    content: '![](https://old.example.com/static/img/nope.webp)',
    deleted: true,
  };

  it('rewrites matching draft content and counts updates', async () => {
    const model = createMemoryDraftModel([{ ...live }, { ...deleted }]);
    const provider = new DraftProvider(model as any, {} as any);

    const result = await provider.rewriteBaseUrl(
      'https://old.example.com',
      'https://new.example.com/',
    );

    expect(result).toEqual({ updated: 1, replacements: 1 });
    expect(model.docs[0].content).toBe('![d](https://new.example.com/static/img/draft.webp)');
    expect(model.docs[1].content).toBe(deleted.content);
    expect(model.updateOne).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when old equals new or either is missing', async () => {
    const model = createMemoryDraftModel([{ ...live }]);
    const provider = new DraftProvider(model as any, {} as any);

    await expect(provider.rewriteBaseUrl('https://old.example.com/', 'https://old.example.com')).resolves.toEqual({
      updated: 0,
      replacements: 0,
    });
    await expect(provider.rewriteBaseUrl(undefined as any, 'https://new.example.com')).resolves.toEqual({
      updated: 0,
      replacements: 0,
    });
    expect(model.docs[0].content).toBe(live.content);
    expect(model.find).not.toHaveBeenCalled();
  });

  it('rejects a non-empty value that is not an http(s) URL', async () => {
    const model = createMemoryDraftModel([{ ...live }]);
    const provider = new DraftProvider(model as any, {} as any);
    await expect(
      provider.rewriteBaseUrl('https://old.example.com', 'javascript:alert(1)'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.docs[0].content).toBe(live.content);
  });
});
