import { BackupController } from '../src/controller/admin/backup/backup.controller';
import { collectCategoriesFromBackup, toExportCategory } from '../src/utils/backupCategories';
import { CategoryProvider } from '../src/provider/category/category.provider';
import { UserProvider } from '../src/provider/user/user.provider';
import { encryptPassword, makeSalt } from '../src/utils/crypto';

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

function asExec(value: any) {
  const promise: any = Promise.resolve(value);
  promise.exec = () => Promise.resolve(value);
  return promise;
}

function createMemoryUserModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => {
    if (!query || !Object.keys(query).length) {
      return docs[0] || null;
    }
    return (
      docs.find((item) => Object.entries(query).every(([key, value]) => item[key] === value)) ||
      null
    );
  };
  return {
    docs,
    findOne: jest.fn((query: any) => asExec(findMatching(query))),
    updateOne: jest.fn((query: any, patch: any) => {
      const target = findMatching(query);
      if (target) {
        Object.assign(target, patch);
      }
      return asExec({ acknowledged: true });
    }),
  };
}

function mockImportSink() {
  return {
    importArticles: jest.fn(async (articles: any[]) => articles),
    importDrafts: jest.fn(async (drafts: any[]) => drafts),
    importCategories: jest.fn(),
    update: jest.fn(),
    importSetting: jest.fn(),
    importItems: jest.fn(),
    import: jest.fn(),
    activeAll: jest.fn(),
    getAll: jest.fn(),
    getAllCategories: jest.fn(),
    getAllTags: jest.fn(),
    getUser: jest.fn(),
    getStaticSetting: jest.fn(),
    exportAll: jest.fn(),
    updateUser: jest.fn(),
  };
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
    const categoryProvider = new CategoryProvider(newMachineCategories as any, {} as any, {} as any);
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
    const categoryProvider = new CategoryProvider(newMachineCategories as any, {} as any, {} as any);
    await categoryProvider.importCategories(collectCategoriesFromBackup(exported));

    expect(await categoryProvider.getAllCategories()).toEqual(['随笔', '教程']);
    expect(publicArticleList(exported.articles, newMachineCategories.docs)).toHaveLength(2);
  });

  it('recreates categories from article names when the backup omitted them', async () => {
    const exported = {
      articles: oldMachineArticles,
    };

    const newMachineCategories = createMemoryCategoryModel();
    const categoryProvider = new CategoryProvider(newMachineCategories as any, {} as any, {} as any);
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

describe('backup restore keeps new-machine admin (#280)', () => {
  const oldMachineArticles = [
    {
      id: 1,
      title: '迁徙后的第一篇',
      category: '随笔',
      author: '旧站作者',
      content: 'hello',
      hidden: false,
      private: false,
    },
    {
      id: 2,
      title: 'Docker 部署笔记',
      category: '教程',
      author: '旧站作者',
      content: 'compose',
      hidden: false,
      private: false,
    },
  ];

  it('lets the new-machine admin keep logging in after a full import', async () => {
    const newAdminPassword = 'new-machine-pass';
    const salt = makeSalt();
    const newAdmin = {
      id: 0,
      name: 'newadmin',
      nickname: '新机器管理员',
      type: 'admin',
      salt,
      password: encryptPassword('newadmin', newAdminPassword, salt),
    };
    const userModel = createMemoryUserModel([newAdmin]);
    const userProvider = new UserProvider(userModel as any);
    const categoryModel = createMemoryCategoryModel();
    const categoryProvider = new CategoryProvider(categoryModel as any, {} as any, {} as any);
    const articleProvider = mockImportSink();
    const draftProvider = mockImportSink();
    const metaProvider = mockImportSink();
    const viewerProvider = mockImportSink();
    const visitProvider = mockImportSink();
    const settingProvider = mockImportSink();
    const staticProvider = mockImportSink();
    const isrProvider = mockImportSink();
    const tagProvider = mockImportSink();

    const controller = new BackupController(
      articleProvider as any,
      categoryProvider,
      tagProvider as any,
      metaProvider as any,
      draftProvider as any,
      userProvider,
      viewerProvider as any,
      visitProvider as any,
      settingProvider as any,
      staticProvider as any,
      isrProvider as any,
    );

    const backup = {
      articles: oldMachineArticles,
      categories: [
        { id: 1, name: '随笔', type: 'category', private: false },
        { id: 2, name: '教程', type: 'category', private: false },
      ],
      drafts: [],
      meta: { siteInfo: { siteName: 'old-site', author: '旧站作者' }, categories: ['随笔', '教程'] },
      user: {
        id: 0,
        name: 'oldadmin',
        nickname: '旧站作者',
        password: encryptPassword('oldadmin', 'old-site-pass', makeSalt()),
        salt: 'oldsalt',
      },
      viewer: [],
      visit: [],
      setting: { static: {} },
      static: [],
    };

    const result = await controller.importAll({
      buffer: Buffer.from(JSON.stringify(backup)),
    } as any);

    expect(result).toEqual({ statusCode: 200, data: '导入成功！' });

    const stillLoggedIn = await userProvider.validateUser('newadmin', newAdminPassword);
    expect(stillLoggedIn).toMatchObject({ name: 'newadmin', nickname: '新机器管理员' });
    expect(await userProvider.validateUser('oldadmin', 'old-site-pass')).toBeNull();
    expect(userModel.docs[0].name).toBe('newadmin');

    expect(articleProvider.importArticles).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: '迁徙后的第一篇', author: '旧站作者' }),
        expect.objectContaining({ title: 'Docker 部署笔记', author: '旧站作者' }),
      ]),
    );
    expect((await categoryProvider.getAllCategories()).sort()).toEqual(['教程', '随笔']);
  });

  it('reproduces the old lockout: applying backup user overwrites the new admin', async () => {
    const newAdminPassword = 'new-machine-pass';
    const salt = makeSalt();
    const userModel = createMemoryUserModel([
      {
        id: 0,
        name: 'newadmin',
        type: 'admin',
        salt,
        password: encryptPassword('newadmin', newAdminPassword, salt),
      },
    ]);
    const userProvider = new UserProvider(userModel as any);

    await userProvider.updateUser({
      name: 'oldadmin',
      password: 'old-hashed-from-backup',
    });

    expect(await userProvider.validateUser('newadmin', newAdminPassword)).toBeNull();
    expect(userModel.docs[0].name).toBe('oldadmin');
  });
});
