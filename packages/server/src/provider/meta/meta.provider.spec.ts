import { MetaProvider } from './meta.provider';

function createMemoryMetaModel(links: any[] = []) {
  const state: any = { links: links.map((item) => ({ ...item })) };
  return {
    state,
    findOne: jest.fn(() => ({
      exec: async () => state,
    })),
    updateOne: jest.fn(async (_query: any, patch: any) => {
      Object.assign(state, patch);
      return { acknowledged: true, modifiedCount: 1 };
    }),
  };
}

function createProvider(links: any[] = []) {
  const model = createMemoryMetaModel(links);
  const provider = new MetaProvider(model as any, {} as any, {} as any, {} as any, {} as any);
  return { provider, model };
}

const urlNamed = {
  name: 'https://testbug',
  url: 'https://example.com',
  desc: 'repro',
  logo: 'https://example.com/logo.png',
};

describe('MetaProvider friend links (#252)', () => {
  it('creates and deletes a link whose 伙伴名 is a URL', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateLink(urlNamed);
    expect(await provider.getLinks()).toEqual([
      expect.objectContaining({ name: 'https://testbug', url: 'https://example.com' }),
    ]);

    await provider.deleteLink('https://testbug');
    expect(await provider.getLinks()).toEqual([]);
  });

  it('renames a URL-named link in place without duplicating', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateLink(urlNamed);
    await provider.addOrUpdateLink({
      ...urlNamed,
      name: 'Fixed Blog',
      desc: 'corrected',
      oldName: 'https://testbug',
    });

    const links = await provider.getLinks();
    expect(links).toHaveLength(1);
    expect(links[0]).toEqual(
      expect.objectContaining({
        name: 'Fixed Blog',
        url: 'https://example.com',
        desc: 'corrected',
      }),
    );
  });

  it('updates a URL-named link when the name is unchanged', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateLink(urlNamed);
    await provider.addOrUpdateLink({
      ...urlNamed,
      desc: 'same name, new intro',
      oldName: 'https://testbug',
    });

    const links = await provider.getLinks();
    expect(links).toHaveLength(1);
    expect(links[0].name).toBe('https://testbug');
    expect(links[0].desc).toBe('same name, new intro');
  });

  it('still creates, updates, and deletes a normal 伙伴名', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateLink({
      name: '伙伴博客',
      url: 'https://friend.example',
      desc: 'hello',
      logo: '/logo.png',
    });
    await provider.addOrUpdateLink({
      name: '伙伴博客',
      url: 'https://friend.example/new',
      desc: 'updated',
      logo: '/logo.png',
    });
    expect(await provider.getLinks()).toHaveLength(1);
    expect((await provider.getLinks())[0].url).toBe('https://friend.example/new');

    await provider.deleteLink('伙伴博客');
    expect(await provider.getLinks()).toEqual([]);
  });
});
