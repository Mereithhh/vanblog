import { ArticleProvider } from './article.provider';
import { wordCount } from 'src/utils/wordCount';

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
    find: jest.fn((query: any) => ({
      exec: async () => docs.filter((item) => matchesMongoQuery(item, query)),
    })),
    updateOne: jest.fn((query: any, patch: any) => {
      const exec = async () => {
        const target = docs.find((item) => item.id === query.id);
        if (!target) {
          return { modifiedCount: 0 };
        }
        Object.assign(target, patch);
        return { modifiedCount: 1 };
      };
      return { exec, then: (resolve: any, reject: any) => exec().then(resolve, reject) };
    }),
  };
}

function createProvider(model: any, metaProvider: any = { updateTotalWords: jest.fn() }) {
  return new ArticleProvider(model, {} as any, metaProvider as any, {} as any);
}

const PUBLISHED_A = '你好世界';
const PUBLISHED_B = '编辑器字数 hello world';
const DRAFT_LIKE = `${'草稿内容'.repeat(50)} ${'code '.repeat(200)}`;

describe('ArticleProvider countTotalWords (#293)', () => {
  it('sums published article counts with the editor metric', async () => {
    const model = createMemoryArticleModel([
      { id: 1, content: PUBLISHED_A, deleted: false, hidden: false },
      { id: 2, content: PUBLISHED_B, deleted: false, hidden: false },
    ]);
    const provider = createProvider(model);

    const total = await provider.countTotalWords();
    expect(total).toBe(wordCount(PUBLISHED_A) + wordCount(PUBLISHED_B));
    expect(total).toBe(4 + 7);
  });

  it('does not let hidden, deleted, or draft-sized copies inflate 总字数', async () => {
    const published = { id: 1, content: PUBLISHED_A, deleted: false, hidden: false };
    const hiddenCopies = Array.from({ length: 10 }, (_, i) => ({
      id: 10 + i,
      content: DRAFT_LIKE,
      deleted: false,
      hidden: true,
    }));
    const deletedCopies = Array.from({ length: 10 }, (_, i) => ({
      id: 20 + i,
      content: DRAFT_LIKE,
      deleted: true,
      hidden: false,
    }));
    const model = createMemoryArticleModel([published, ...hiddenCopies, ...deletedCopies]);
    const provider = createProvider(model);

    const total = await provider.countTotalWords();
    const inflated = wordCount(PUBLISHED_A) + 20 * wordCount(DRAFT_LIKE);
    const asUtf8Bytes = Buffer.byteLength(PUBLISHED_A, 'utf8');

    expect(total).toBe(wordCount(PUBLISHED_A));
    expect(total).toBe(4);
    expect(inflated).toBeGreaterThan(total * 10);
    expect(total).not.toBe(asUtf8Bytes);
  });

  it('updates after edit and delete', async () => {
    const metaProvider = { updateTotalWords: jest.fn() };
    const model = createMemoryArticleModel([
      { id: 1, content: PUBLISHED_A, deleted: false, hidden: false },
      { id: 2, content: PUBLISHED_B, deleted: false, hidden: false },
    ]);
    const provider = createProvider(model, metaProvider);

    expect(await provider.countTotalWords()).toBe(11);

    await provider.updateById(2, { content: '改' });
    expect(metaProvider.updateTotalWords).toHaveBeenCalledWith('更新文章');
    expect(await provider.countTotalWords()).toBe(wordCount(PUBLISHED_A) + wordCount('改'));

    await provider.deleteById(1);
    expect(metaProvider.updateTotalWords).toHaveBeenCalledWith('删除文章');
    expect(await provider.countTotalWords()).toBe(wordCount('改'));
  });
});
