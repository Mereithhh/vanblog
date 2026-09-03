import { ForbiddenException } from '@nestjs/common';
import { CustomPageProvider } from './customPage.provider';

function createMemoryCustomPageModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => {
    if (query?._id != null) {
      return docs.find((item) => String(item._id) === String(query._id)) || null;
    }
    if (query?.path != null) {
      return docs.find((item) => item.path === query.path) || null;
    }
    return null;
  };
  return {
    docs,
    findOne: jest.fn(async (query: any) => findMatching(query)),
    find: jest.fn(async (_query?: any, projection?: any) => {
      return docs.map((doc) => {
        if (projection?.html === 0) {
          const { html, ...rest } = doc;
          return rest;
        }
        return { ...doc };
      });
    }),
    create: jest.fn(async (doc: any) => {
      const created = {
        _id: doc._id || `cp-${docs.length + 1}`,
        html: '',
        type: 'file',
        ...doc,
      };
      docs.push(created);
      return created;
    }),
    updateOne: jest.fn(async (query: any, patch: any) => {
      const target = findMatching(query);
      if (!target) {
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      }
      Object.assign(target, patch);
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    }),
  };
}

describe('CustomPageProvider.updateCustomPage', () => {
  it('create, edit name/path, then list shows persisted fields (#453)', async () => {
    const model = createMemoryCustomPageModel();
    const provider = new CustomPageProvider(model as any);

    const created = await provider.createCustomPage({
      name: '旧名称',
      path: '/old-path',
      type: 'file',
    } as any);

    await provider.updateCustomPage({
      _id: created._id,
      name: '新名称',
      path: '/new-path',
    } as any);

    const listed = await provider.getAll();
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({
      _id: created._id,
      name: '新名称',
      path: '/new-path',
    });
    expect(await provider.getCustomPageByPath('/old-path')).toBeNull();
    expect(await provider.getCustomPageByPath('/new-path')).toMatchObject({
      name: '新名称',
      path: '/new-path',
    });
  });

  it('updates name when path is unchanged even without _id', async () => {
    const model = createMemoryCustomPageModel([
      { _id: 'cp-1', name: '旧名称', path: '/about', type: 'folder', html: '<p>keep</p>' },
    ]);
    const provider = new CustomPageProvider(model as any);

    await provider.updateCustomPage({ name: '关于我们', path: '/about' } as any);

    expect(model.docs[0]).toMatchObject({
      _id: 'cp-1',
      name: '关于我们',
      path: '/about',
      html: '<p>keep</p>',
    });
  });

  it('does not match the row when path changes and _id is missing', async () => {
    const model = createMemoryCustomPageModel([
      { _id: 'cp-1', name: '旧名称', path: '/old-path', type: 'file', html: '<p>keep</p>' },
    ]);
    const provider = new CustomPageProvider(model as any);

    const result = await provider.updateCustomPage({
      name: '新名称',
      path: '/new-path',
    } as any);

    expect(result).toMatchObject({ matchedCount: 0, modifiedCount: 0 });
    expect(model.docs[0]).toMatchObject({
      name: '旧名称',
      path: '/old-path',
      html: '<p>keep</p>',
    });
  });

  it('preserves html when 修改信息 only sends name and path', async () => {
    const model = createMemoryCustomPageModel([
      { _id: 'cp-1', name: '旧名称', path: '/old-path', type: 'file', html: '<h1>body</h1>' },
    ]);
    const provider = new CustomPageProvider(model as any);

    await provider.updateCustomPage({
      _id: 'cp-1',
      name: '新名称',
      path: '/new-path',
    } as any);

    expect(model.docs[0].html).toBe('<h1>body</h1>');
  });

  it('saves html when the editor sends _id and html', async () => {
    const model = createMemoryCustomPageModel([
      { _id: 'cp-1', name: '页面', path: '/page', type: 'file', html: '<p>old</p>' },
    ]);
    const provider = new CustomPageProvider(model as any);

    await provider.updateCustomPage({
      _id: 'cp-1',
      name: '页面',
      path: '/page',
      html: '<p>new</p>',
    } as any);

    expect(model.docs[0].html).toBe('<p>new</p>');
  });

  it('rejects a path that already belongs to another page', async () => {
    const model = createMemoryCustomPageModel([
      { _id: 'cp-1', name: 'A', path: '/a', type: 'file', html: '' },
      { _id: 'cp-2', name: 'B', path: '/b', type: 'file', html: '' },
    ]);
    const provider = new CustomPageProvider(model as any);

    await expect(
      provider.updateCustomPage({ _id: 'cp-1', name: 'A', path: '/b' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(model.docs[0].path).toBe('/a');
  });
});
