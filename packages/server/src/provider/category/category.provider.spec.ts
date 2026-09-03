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
    find: jest.fn(() => ({
      sort: () => ({
        limit: async () =>
          [...docs].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 1),
      }),
    })),
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

describe('CategoryProvider.importCategories', () => {
  it('creates missing category documents from a backup', async () => {
    const model = createMemoryCategoryModel();
    const provider = new CategoryProvider(model as any, {} as any);

    await provider.importCategories([
      { id: 1, name: '随笔', type: 'category', private: false, password: '' },
      { name: '教程' },
    ]);

    expect(model.docs.map((item) => item.name)).toEqual(['随笔', '教程']);
    expect(model.docs[1].id).toBe(1);
    expect(model.docs[1].type).toBe('category');
  });

  it('does not duplicate existing names and updates private fields', async () => {
    const model = createMemoryCategoryModel([
      { id: 1, name: '随笔', type: 'category', private: false, password: '' },
    ]);
    const provider = new CategoryProvider(model as any, {} as any);

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
    const provider = new CategoryProvider(model as any, {} as any);

    await provider.importCategories([{ id: 1, name: '新分类' }]);

    expect(model.docs.map((item) => item.name)).toEqual(['已存在', '新分类']);
    expect(model.docs[1].id).toBe(2);
  });
});
