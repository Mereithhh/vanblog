import { collectCategoriesFromBackup, toExportCategory } from './backupCategories';

describe('collectCategoriesFromBackup', () => {
  it('keeps full category documents from current exports', () => {
    const categories = collectCategoriesFromBackup({
      categories: [
        { id: 1, name: '随笔', type: 'category', private: false, password: '' },
        { id: 2, name: '教程', type: 'category', private: true, password: 'secret', hidden: true, order: 1 },
      ],
      articles: [{ category: '随笔' }],
    });

    expect(categories).toEqual([
      { id: 1, name: '随笔', type: 'category', private: false, password: '' },
      {
        id: 2,
        name: '教程',
        type: 'category',
        private: true,
        password: 'secret',
        hidden: true,
        order: 1,
      },
    ]);
  });

  it('supports older backups that only export category names', () => {
    expect(
      collectCategoriesFromBackup({
        categories: ['随笔', '教程'],
      }),
    ).toEqual([{ name: '随笔' }, { name: '教程' }]);
  });

  it('rebuilds categories from articles and drafts when the collection is missing', () => {
    const categories = collectCategoriesFromBackup({
      articles: [{ category: '随笔' }, { category: '教程' }, { category: '随笔' }],
      drafts: [{ category: '草稿分类' }],
    });

    expect(categories.map((item) => item.name)).toEqual(['随笔', '教程', '草稿分类']);
  });

  it('falls back to meta.categories from pre-category-table backups', () => {
    expect(
      collectCategoriesFromBackup({
        meta: { categories: ['历史分类'] },
      }),
    ).toEqual([{ name: '历史分类' }]);
  });

  it('ignores empty names', () => {
    expect(
      collectCategoriesFromBackup({
        categories: ['', '  ', null, { name: '' }],
        articles: [{ category: '' }, {}],
      }),
    ).toEqual([]);
  });
});

describe('toExportCategory', () => {
  it('serializes a category document without mongoose internals', () => {
    expect(
      toExportCategory({
        _id: 'abc',
        __v: 0,
        id: 3,
        name: '随笔',
        type: 'category',
        private: true,
        password: 'pw',
        hidden: true,
        order: 2,
      }),
    ).toEqual({
      id: 3,
      name: '随笔',
      type: 'category',
      private: true,
      password: 'pw',
      hidden: true,
      order: 2,
    });
  });

  it('keeps order when present and omits it for older rows', () => {
    expect(
      collectCategoriesFromBackup({
        categories: [
          { name: '深度学习', order: 0 },
          { name: 'Linux运维', order: 1 },
          { name: '旧分类' },
        ],
      }),
    ).toEqual([
      { name: '深度学习', order: 0 },
      { name: 'Linux运维', order: 1 },
      { name: '旧分类' },
    ]);
    expect(toExportCategory({ id: 1, name: '随笔', type: 'category' })).toEqual({
      id: 1,
      name: '随笔',
      type: 'category',
      private: false,
      password: '',
      hidden: false,
    });
  });
});
