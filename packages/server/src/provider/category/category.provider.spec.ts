import { NotAcceptableException } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';
import { DraftProvider } from '../draft/draft.provider';
import { CategoryProvider } from './category.provider';

function createMemoryCategoryModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => {
    if (query?.name) {
      return docs.find((item) => item.name === query.name) || null;
    }
    if (query?.id != null) {
      return docs.find((item) => item.id === query.id) || null;
    }
    return null;
  };
  return {
    docs,
    findOne: jest.fn(async (query: any) => findMatching(query)),
    find: jest.fn((query?: any) => {
      const matched =
        !query || !Object.keys(query).length
          ? [...docs]
          : docs.filter((item) =>
              Object.entries(query).every(([key, value]) => item[key] === value),
            );
      const chain: any = Promise.resolve(matched);
      chain.sort = () => ({
        limit: async () => [...matched].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 1),
      });
      return chain;
    }),
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
    }),
    deleteOne: jest.fn(async (query: any) => {
      const target = findMatching(query);
      if (target) {
        docs.splice(docs.indexOf(target), 1);
      }
    }),
  };
}

function createMemoryNamedModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  return {
    docs,
    updateMany: jest.fn(async (query: any, patch: any) => {
      let modifiedCount = 0;
      for (const doc of docs) {
        if (query?.category != null && doc.category !== query.category) {
          continue;
        }
        Object.assign(doc, patch);
        modifiedCount += 1;
      }
      return { modifiedCount };
    }),
    updateOne: jest.fn(async (query: any, patch: any) => {
      const target = docs.find((item) => item.id === query.id);
      if (!target) {
        return { modifiedCount: 0 };
      }
      Object.assign(target, patch);
      return { modifiedCount: 1 };
    }),
    find: jest.fn(() => ({
      sort: () => ({
        exec: async () => [...docs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      }),
    })),
  };
}

function createRenameStack(seed?: {
  categories?: any[];
  articles?: any[];
  drafts?: any[];
}) {
  const categoryModel = createMemoryCategoryModel(seed?.categories || []);
  const articleModel = createMemoryNamedModel(seed?.articles || []);
  const draftModel = createMemoryNamedModel(seed?.drafts || []);
  const articleProvider = new ArticleProvider(
    articleModel as any,
    {} as any,
    { updateTotalWords: jest.fn() } as any,
    {} as any,
  );
  const draftProvider = new DraftProvider(draftModel as any, articleProvider);
  const categoryProvider = new CategoryProvider(
    categoryModel as any,
    articleProvider,
    draftProvider,
  );
  return {
    categoryModel,
    articleModel,
    draftModel,
    articleProvider,
    draftProvider,
    categoryProvider,
  };
}

describe('CategoryProvider.importCategories', () => {
  it('creates missing category documents from a backup', async () => {
    const model = createMemoryCategoryModel();
    const provider = new CategoryProvider(model as any, {} as any, {} as any);

    await provider.importCategories([
      { id: 1, name: '随笔', type: 'category', private: false, password: '' },
      { name: '教程' },
    ]);

    expect(model.docs.map((item) => item.name)).toEqual(['随笔', '教程']);
    expect(model.docs[0].id).toBe(1);
    expect(model.docs[1].id).toBe(2);
    expect(model.docs[1].type).toBe('category');
  });

  it('does not duplicate existing names and updates private fields', async () => {
    const model = createMemoryCategoryModel([
      { id: 1, name: '随笔', type: 'category', private: false, password: '' },
    ]);
    const provider = new CategoryProvider(model as any, {} as any, {} as any);

    await provider.importCategories([
      { id: 9, name: '随笔', private: true, password: 'pw' },
    ]);

    expect(model.docs).toHaveLength(1);
    expect(model.docs[0]).toMatchObject({
      id: 1,
      name: '随笔',
      private: true,
      password: 'pw',
    });
  });

  it('allocates a new id when the exported id is already used by another name', async () => {
    const model = createMemoryCategoryModel([
      { id: 1, name: '已存在', type: 'category', private: false },
    ]);
    const provider = new CategoryProvider(model as any, {} as any, {} as any);

    await provider.importCategories([{ id: 1, name: '新分类' }]);

    expect(model.docs.map((item) => item.name)).toEqual(['已存在', '新分类']);
    expect(model.docs[1].id).toBe(2);
  });
});

describe('CategoryProvider.updateCategoryByName (#324)', () => {
  it('renames the category and rewrites every article and draft that used the old name', async () => {
    const stack = createRenameStack();
    await stack.categoryProvider.addOne('AAA');
    stack.articleModel.docs.push(
      { id: 1, title: '已发布', category: 'AAA', hidden: false, deleted: false },
      { id: 2, title: '隐藏文章', category: 'AAA', hidden: true, deleted: false },
      { id: 3, title: '其他分类', category: '教程', hidden: false, deleted: false },
    );
    stack.draftModel.docs.push(
      { id: 1, title: '未发布草稿', category: 'AAA', deleted: false },
      { id: 2, title: '已删草稿', category: 'AAA', deleted: true },
      { id: 3, title: '别的草稿', category: '教程', deleted: false },
    );

    await stack.categoryProvider.updateCategoryByName('AAA', { name: 'BBB' });

    expect(stack.categoryModel.docs.map((item) => item.name)).toEqual(['BBB']);
    expect(stack.articleModel.docs.map((item) => item.category)).toEqual(['BBB', 'BBB', '教程']);
    expect(stack.draftModel.docs.map((item) => item.category)).toEqual(['BBB', 'BBB', '教程']);
    expect(stack.articleModel.docs.some((item) => item.category === 'AAA')).toBe(false);
    expect(stack.draftModel.docs.some((item) => item.category === 'AAA')).toBe(false);
    expect(await stack.categoryProvider.getAllCategories()).toEqual(['BBB']);
  });

  it('keeps creating and editing posts after a rename', async () => {
    const stack = createRenameStack({
      categories: [{ id: 1, name: 'AAA', type: 'category', private: false }],
      articles: [{ id: 1, title: '旧文', category: 'AAA', deleted: false }],
      drafts: [{ id: 1, title: '旧草稿', category: 'AAA', deleted: false }],
    });

    await stack.categoryProvider.updateCategoryByName('AAA', { name: 'BBB' });
    await stack.articleProvider.updateById(1, { title: '旧文已改' });
    await stack.draftProvider.updateById(1, { title: '旧草稿已改' });
    stack.articleModel.docs.push({ id: 2, title: '新文', category: 'BBB', deleted: false });
    stack.draftModel.docs.push({ id: 2, title: '新草稿', category: 'BBB', deleted: false });

    expect(stack.articleModel.docs.map((item) => [item.title, item.category])).toEqual([
      ['旧文已改', 'BBB'],
      ['新文', 'BBB'],
    ]);
    expect(stack.draftModel.docs.map((item) => [item.title, item.category])).toEqual([
      ['旧草稿已改', 'BBB'],
      ['新草稿', 'BBB'],
    ]);
  });

  it('still refuses to delete a category that has articles', async () => {
    const stack = createRenameStack({
      categories: [{ id: 1, name: 'BBB', type: 'category', private: false }],
      articles: [{ id: 1, title: '还在', category: 'BBB', deleted: false }],
    });
    stack.articleModel.find = jest.fn(() => ({
      sort: () => ({
        exec: async () => stack.articleModel.docs,
      }),
    }));

    await expect(stack.categoryProvider.deleteOne('BBB')).rejects.toBeInstanceOf(
      NotAcceptableException,
    );
    expect(stack.categoryModel.docs.map((item) => item.name)).toEqual(['BBB']);
  });

  it('rejects a rename that would collide with an existing category', async () => {
    const stack = createRenameStack({
      categories: [
        { id: 1, name: 'AAA', type: 'category', private: false },
        { id: 2, name: 'BBB', type: 'category', private: false },
      ],
      articles: [{ id: 1, title: '文', category: 'AAA', deleted: false }],
    });

    await expect(
      stack.categoryProvider.updateCategoryByName('AAA', { name: 'BBB' }),
    ).rejects.toBeInstanceOf(NotAcceptableException);
    expect(stack.articleModel.docs[0].category).toBe('AAA');
    expect(stack.categoryModel.docs.map((item) => item.name)).toEqual(['AAA', 'BBB']);
  });
});
