import { AnalysisProvider } from '../src/provider/analysis/analysis.provider';
import { ArticleProvider } from '../src/provider/article/article.provider';
import { MetaProvider } from '../src/provider/meta/meta.provider';
import { PublicController } from '../src/controller/public/public.controller';
import { wordCount } from '../src/utils/wordCount';

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
  const findMatching = (query: any) => docs.filter((item) => matchesMongoQuery(item, query));
  return {
    docs,
    find: jest.fn((query: any) => {
      const matched = () => findMatching(query);
      return {
        exec: async () => matched(),
        count: async () => matched().length,
      };
    }),
    count: jest.fn(async (query: any) => findMatching(query).length),
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

const CJK = '你好世界';
const MIXED = '编辑器字数 hello world';
const HUGE_DRAFT = `${'未发布草稿'.repeat(80)}${' function '.repeat(400)}`;

async function flushDebouncedWordCount() {
  jest.advanceTimersByTime(30_000);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('public 总字数 matches published editor counts (e2e #293)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('GET /api/public/meta 总字数 equals published articles, not bytes or drafts', async () => {
    const published = [
      { id: 1, content: CJK, deleted: false, hidden: false },
      { id: 2, content: MIXED, deleted: false, hidden: false },
    ];
    const notPublic = [
      { id: 3, content: HUGE_DRAFT, deleted: false, hidden: true },
      { id: 4, content: HUGE_DRAFT, deleted: true, hidden: false },
    ];
    const drafts = Array.from({ length: 10 }, (_, i) => ({
      id: 100 + i,
      content: HUGE_DRAFT,
    }));

    const model = createMemoryArticleModel([...published, ...notPublic]);
    const metaDoc: any = { totalWordCount: 0, siteInfo: { baseUrl: 'https://blog.example.com' } };
    const metaModel = {
      findOne: () => ({ exec: async () => metaDoc }),
      updateOne: async (_query: any, patch: any) => {
        Object.assign(metaDoc, patch);
        return { modifiedCount: 1 };
      },
    };

    const metaRef: { current: MetaProvider | null } = { current: null };
    const articleProvider = new ArticleProvider(
      model as any,
      {} as any,
      { updateTotalWords: (reason: string) => metaRef.current!.updateTotalWords(reason) } as any,
      {} as any,
    );
    const metaProvider = new MetaProvider(
      metaModel as any,
      {} as any,
      {} as any,
      {} as any,
      articleProvider,
    );
    metaRef.current = metaProvider;

    const expected = wordCount(CJK) + wordCount(MIXED);
    expect(expected).toBe(11);
    expect(expected).not.toBe(Buffer.byteLength(CJK + MIXED, 'utf8'));
    expect(10 * wordCount(HUGE_DRAFT)).toBeGreaterThan(expected * 10);

    await metaProvider.updateTotalWords('首次启动');
    await flushDebouncedWordCount();

    expect(drafts).toHaveLength(10);
    expect(await articleProvider.countTotalWords()).toBe(expected);
    expect(await metaProvider.getTotalWords()).toBe(expected);

    const controller = new PublicController(
      articleProvider,
      { getAllCategories: async () => [] } as any,
      { getAllTags: async () => [] } as any,
      metaProvider,
      {} as any,
      {
        getMenuSetting: async () => ({ data: [] }),
        getLayoutSetting: async () => null,
        encodeLayoutSetting: () => ({}),
      } as any,
      {} as any,
    );
    const publicMeta = await controller.getBuildMeta();
    expect(publicMeta.data.totalWordCount).toBe(expected);

    const analysis = new AnalysisProvider(
      metaProvider,
      articleProvider,
      { getViewerGrid: async () => ({}) } as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const overview = await analysis.getOverViewTabData(5);
    expect(overview.total.wordCount).toBe(expected);

    await articleProvider.updateById(2, { content: '改' });
    await flushDebouncedWordCount();
    expect(await metaProvider.getTotalWords()).toBe(wordCount(CJK) + wordCount('改'));

    await articleProvider.deleteById(1);
    await flushDebouncedWordCount();
    expect(await metaProvider.getTotalWords()).toBe(wordCount('改'));
    expect(await metaProvider.getTotalWords()).toBe(1);
  });
});
