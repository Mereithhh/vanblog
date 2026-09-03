import { BackupController } from './backup.controller';

function mockProvider() {
  return {
    getAll: jest.fn(),
    getAllCategories: jest.fn(),
    getAllTags: jest.fn(),
    getUser: jest.fn(),
    getStaticSetting: jest.fn(),
    exportAll: jest.fn(),
    importArticles: jest.fn(),
    importDrafts: jest.fn(),
    importCategories: jest.fn(),
    updateUser: jest.fn(),
    update: jest.fn(),
    importSetting: jest.fn(),
    importItems: jest.fn(),
    import: jest.fn(),
    activeAll: jest.fn(),
  };
}

describe('BackupController.importAll', () => {
  it('imports category documents and triggers ISR so the homepage can refresh', async () => {
    const articleProvider = mockProvider();
    const categoryProvider = mockProvider();
    const tagProvider = mockProvider();
    const metaProvider = mockProvider();
    const draftProvider = mockProvider();
    const userProvider = mockProvider();
    const viewerProvider = mockProvider();
    const visitProvider = mockProvider();
    const settingProvider = mockProvider();
    const staticProvider = mockProvider();
    const isrProvider = mockProvider();

    const controller = new BackupController(
      articleProvider as any,
      categoryProvider as any,
      tagProvider as any,
      metaProvider as any,
      draftProvider as any,
      userProvider as any,
      viewerProvider as any,
      visitProvider as any,
      settingProvider as any,
      staticProvider as any,
      isrProvider as any,
    );

    const backup = {
      articles: [
        { id: 1, title: '迁徙后的第一篇', category: '随笔', _id: 'a1', __v: 0 },
      ],
      categories: [{ id: 1, name: '随笔', type: 'category', private: false }],
      drafts: [],
      meta: { siteInfo: { siteName: 'demo' }, categories: [] },
      user: { name: 'admin', _id: 'u1', __v: 0 },
      viewer: [],
      visit: [],
      setting: { static: {} },
      static: [],
    };

    const result = await controller.importAll({
      buffer: Buffer.from(JSON.stringify(backup)),
    } as any);

    expect(categoryProvider.importCategories).toHaveBeenCalledWith([
      { id: 1, name: '随笔', type: 'category', private: false },
    ]);
    expect(articleProvider.importArticles).toHaveBeenCalled();
    expect(metaProvider.update).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ['随笔'],
      }),
    );
    expect(isrProvider.activeAll).toHaveBeenCalledWith('导入备份触发增量渲染！');
    expect(userProvider.updateUser).not.toHaveBeenCalled();
    expect(result).toEqual({ statusCode: 200, data: '导入成功！' });
  });

  it('keeps the current admin instead of applying backup user credentials', async () => {
    const articleProvider = mockProvider();
    const categoryProvider = mockProvider();
    const tagProvider = mockProvider();
    const metaProvider = mockProvider();
    const draftProvider = mockProvider();
    const userProvider = mockProvider();
    const viewerProvider = mockProvider();
    const visitProvider = mockProvider();
    const settingProvider = mockProvider();
    const staticProvider = mockProvider();
    const isrProvider = mockProvider();

    const controller = new BackupController(
      articleProvider as any,
      categoryProvider as any,
      tagProvider as any,
      metaProvider as any,
      draftProvider as any,
      userProvider as any,
      viewerProvider as any,
      visitProvider as any,
      settingProvider as any,
      staticProvider as any,
      isrProvider as any,
    );

    const backup = {
      articles: [{ id: 1, title: '旧站文章', category: '随笔', author: '旧站作者' }],
      categories: [{ id: 1, name: '随笔' }],
      drafts: [],
      meta: { siteInfo: { siteName: 'old-site', author: '旧站作者' } },
      user: { name: 'oldadmin', password: 'old-hash', salt: 'oldsalt', _id: 'u1', __v: 0 },
      viewer: [],
      visit: [],
      setting: { static: {} },
      static: [],
    };

    const result = await controller.importAll({
      buffer: Buffer.from(JSON.stringify(backup)),
    } as any);

    expect(userProvider.updateUser).not.toHaveBeenCalled();
    expect(articleProvider.importArticles).toHaveBeenCalledWith([
      expect.objectContaining({ title: '旧站文章', author: '旧站作者' }),
    ]);
    expect(result).toEqual({ statusCode: 200, data: '导入成功！' });
  });
});
