import { collectCategoriesFromBackup, toExportCategory } from '../src/utils/backupCategories';
import { CategoryProvider } from '../src/provider/category/category.provider';

/**
 * End-to-end of the backup export → new machine import path that #496 / #280
 * reported: articles keep category names, but Category documents were skipped.
 */
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
    find: jest.fn((query?: any) => {
      const matched = !query || !Object.keys(query).length ? [...docs] : docs.filter((item) => {
        return Object.entries(query).every(([key, value]) => item[key] === value);
      });
      const chain: any = Promise.resolve(matched);
      chain.sort = () => ({
        limit: async () => [...matched].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 1),
      });
      return chain;
    }),
    findOne: jest.fn(async (query: any) => findMatching(query)),
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
  };
}

function publicArticleList(articles: any[], categories: any[]) {
  return articles
    .filter((article) => !article.hidden && !article.deleted)
    .map((article) => {
      const category = categories.find((item) => item.name === article.category);
      return {
        id: article.id,
        title: article.title,
        category: article.category,
        private: Boolean(article.private || category?.private),
      };
    });
}

function publicMetaCategories(categoryDocs: any[]) {
  return categoryDocs.map((item) => item.name);
}

describe('backup restore categories (e2e)', () => {
  const oldMachineArticles = [
    {
      id: 1,
      title: '迁徙后的第一篇',
      category: '随笔',
      content: 'hello',
      hidden: false,
      private: false,
    },
    {
      id: 2,
      title: 'Docker 部署笔记',
      category: '教程',
      content: 'compose',
      hidden: false,
      private: false,
    },
  ];
  const oldMachineCategories = [
    { id: 1, name: '随笔', type: 'category', private: false, password: '' },
    { id: 2, name: '教程', type: 'category', private: false, password: '' },
  ];

  it('exports articles+categories and restores both on a new machine', async () => {
    const exported = {
      articles: oldMachineArticles,
      categories: oldMachineCategories.map((item) => toExportCategory(item)),
      drafts: [],
      meta: { siteInfo: { siteName: 'demo' }, categories: ['随笔', '教程'] },
      user: { name: 'admin' },
    };

    const newMachineCategories = createMemoryCategoryModel();
    const categoryProvider = new CategoryProvider(newMachineCategories as any, {} as any);
    let importedArticles: any[] = [];

    const toImportCategories = collectCategoriesFromBackup(exported);
    await categoryProvider.importCategories(toImportCategories);
    importedArticles = exported.articles;
    if (toImportCategories.length) {
      exported.meta.categories = toImportCategories.map((item) => item.name);
    }

    const managed = await categoryProvider.getAllCategories(true);
    expect(managed.map((item: any) => item.name).sort()).toEqual(['教程', '随笔']);

    const homepage = publicArticleList(importedArticles, newMachineCategories.docs);
    expect(homepage.map((item) => item.title)).toEqual([
      '迁徙后的第一篇',
      'Docker 部署笔记',
    ]);
    expect(publicMetaCategories(newMachineCategories.docs).sort()).toEqual(['教程', '随笔']);
  });

  it('still restores Category documents from old name-only backups', async () => {
    const exported = {
      articles: oldMachineArticles,
      categories: ['随笔', '教程'],
      meta: { categories: [] },
    };

    const newMachineCategories = createMemoryCategoryModel();
    const categoryProvider = new CategoryProvider(newMachineCategories as any, {} as any);
    await categoryProvider.importCategories(collectCategoriesFromBackup(exported));

    expect(await categoryProvider.getAllCategories()).toEqual(['随笔', '教程']);
    expect(publicArticleList(exported.articles, newMachineCategories.docs)).toHaveLength(2);
  });

  it('recreates categories from article names when the backup omitted them', async () => {
    const exported = {
      articles: oldMachineArticles,
    };

    const newMachineCategories = createMemoryCategoryModel();
    const categoryProvider = new CategoryProvider(newMachineCategories as any, {} as any);
    await categoryProvider.importCategories(collectCategoriesFromBackup(exported));

    expect(await categoryProvider.getAllCategories()).toEqual(['随笔', '教程']);
  });

  it('reproduces the old bug: articles exist but category management is empty', async () => {
    const exported = {
      articles: oldMachineArticles,
      categories: oldMachineCategories.map((item) => toExportCategory(item)),
    };

    // Pre-fix import: restore articles only.
    const leakedCategories = createMemoryCategoryModel();
    const homepageWithoutCategories = publicArticleList(exported.articles, leakedCategories.docs);
    expect(homepageWithoutCategories).toHaveLength(2);
    expect(leakedCategories.docs).toEqual([]);
    expect(publicMetaCategories(leakedCategories.docs)).toEqual([]);
  });
});
