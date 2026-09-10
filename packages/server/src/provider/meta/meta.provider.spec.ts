import { MetaProvider } from './meta.provider';

function createMemoryMetaModel(links: any[] = []) {
  const state: any = { links: links.map((item) => ({ ...item })), socials: [] };
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

describe('MetaProvider articlesPerPage (#346)', () => {
  it('defaults getArticlesPerPage to 5 when siteInfo is missing or unset', async () => {
    const { provider } = createProvider();
    expect(await provider.getArticlesPerPage()).toBe(5);

    const withSite = createProvider();
    withSite.model.state.siteInfo = { siteName: 'demo' };
    expect(await withSite.provider.getArticlesPerPage()).toBe(5);
    expect((await withSite.provider.getSiteInfo()).articlesPerPage).toBe(5);
  });

  it('returns a configured size', async () => {
    const { provider, model } = createProvider();
    model.state.siteInfo = { siteName: 'demo', articlesPerPage: 12 };
    expect(await provider.getArticlesPerPage()).toBe(12);
    expect((await provider.getSiteInfo()).articlesPerPage).toBe(12);
  });

  it('clamps on read so a huge stored value cannot DoS lists', async () => {
    const { provider, model } = createProvider();
    model.state.siteInfo = { articlesPerPage: 9999 };
    expect(await provider.getArticlesPerPage()).toBe(50);
  });

  it('persists a clamped size on update', async () => {
    const { provider, model } = createProvider();
    await provider.updateSiteInfo({ siteName: 'demo', articlesPerPage: 10 } as any);
    expect(model.state.siteInfo.articlesPerPage).toBe(10);

    await provider.updateSiteInfo({ articlesPerPage: 0 } as any);
    expect(model.state.siteInfo.articlesPerPage).toBe(1);

    await provider.updateSiteInfo({ articlesPerPage: 999 } as any);
    expect(model.state.siteInfo.articlesPerPage).toBe(50);

    await provider.updateSiteInfo({ articlesPerPage: 'nope' } as any);
    expect(model.state.siteInfo.articlesPerPage).toBe(5);
  });
});

describe('MetaProvider page copy (#373)', () => {
  it('reads stored friend-link / about copy and treats missing as empty (front falls back)', async () => {
    const missing = createProvider();
    missing.model.state.siteInfo = { siteName: 'demo' };
    expect((await missing.provider.getSiteInfo()).friendLinkIntro).toBe('');
    expect((await missing.provider.getSiteInfo()).friendLinkApplyContent).toBe('');
    expect((await missing.provider.getSiteInfo()).aboutTitle).toBe('');

    const { provider, model } = createProvider();
    model.state.siteInfo = {
      siteName: 'demo',
      friendLinkIntro: '这些是朋友们的站点：',
      friendLinkApplyContent: '请发邮件。{{siteName}}',
      aboutTitle: 'About',
    };
    const site = await provider.getSiteInfo();
    expect(site.friendLinkIntro).toBe('这些是朋友们的站点：');
    expect(site.friendLinkApplyContent).toBe('请发邮件。{{siteName}}');
    expect(site.aboutTitle).toBe('About');
  });

  it('persists custom copy and keeps previous values when a field is omitted', async () => {
    const { provider, model } = createProvider();
    await provider.updateSiteInfo({
      siteName: 'demo',
      friendLinkIntro: '欢迎交换友链',
      friendLinkApplyContent: '**规则**\n请先加本站',
      aboutTitle: '关于本站',
    } as any);
    expect(model.state.siteInfo.friendLinkIntro).toBe('欢迎交换友链');
    expect(model.state.siteInfo.friendLinkApplyContent).toBe('**规则**\n请先加本站');
    expect(model.state.siteInfo.aboutTitle).toBe('关于本站');

    await provider.updateSiteInfo({ siteName: 'demo2' } as any);
    expect(model.state.siteInfo.friendLinkIntro).toBe('欢迎交换友链');
    expect(model.state.siteInfo.friendLinkApplyContent).toBe('**规则**\n请先加本站');
    expect(model.state.siteInfo.aboutTitle).toBe('关于本站');
    expect(model.state.siteInfo.siteName).toBe('demo2');
  });

  it('stores empty copy so the front can fall back, and ignores non-string payloads', async () => {
    const { provider, model } = createProvider();
    await provider.updateSiteInfo({
      siteName: 'demo',
      friendLinkIntro: '自定义介绍',
      aboutTitle: 'About',
    } as any);
    await provider.updateSiteInfo({ friendLinkIntro: '', aboutTitle: 12 } as any);
    expect(model.state.siteInfo.friendLinkIntro).toBe('');
    expect(model.state.siteInfo.aboutTitle).toBe('About');
  });
});

describe('MetaProvider custom socials (#394)', () => {
  it('keeps builtin types unique and still overwrites by type', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateSocial({ type: 'github', value: 'https://github.com/old' });
    await provider.addOrUpdateSocial({ type: 'github', value: 'https://github.com/new' });
    await provider.addOrUpdateSocial({ type: 'email', value: 'hi@example.com' });

    const socials = await provider.getSocials();
    expect(socials).toHaveLength(2);
    expect(socials.find((s) => s.type === 'github')?.value).toBe('https://github.com/new');
    expect(socials.find((s) => s.type === 'email')?.value).toBe('hi@example.com');
    expect(socials.find((s) => s.type === 'github')?.id).toBeUndefined();
    expect(socials.find((s) => s.type === 'github')?.label).toBeUndefined();
  });

  it('adds multiple custom contacts with label, url, and optional icon', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateSocial({
      type: 'custom',
      value: 'https://t.me/vanblog',
      label: 'Telegram',
      icon: 'https://example.com/tg.png',
    });
    await provider.addOrUpdateSocial({
      type: 'custom',
      value: 'https://x.com/vanblog',
      label: 'Twitter / X',
    });

    const socials = await provider.getSocials();
    expect(socials).toHaveLength(2);
    expect(socials.every((s) => s.type === 'custom')).toBe(true);
    expect(socials[0].id).toMatch(/^custom-/);
    expect(socials[1].id).toMatch(/^custom-/);
    expect(socials[0].id).not.toBe(socials[1].id);
    expect(socials[0]).toEqual(
      expect.objectContaining({
        label: 'Telegram',
        value: 'https://t.me/vanblog',
        icon: 'https://example.com/tg.png',
      }),
    );
    expect(socials[1]).toEqual(
      expect.objectContaining({
        label: 'Twitter / X',
        value: 'https://x.com/vanblog',
      }),
    );
    expect(socials[1].icon).toBeUndefined();
  });

  it('updates a custom contact in place by id without replacing another custom', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateSocial({
      type: 'custom',
      value: 'https://t.me/old',
      label: 'Telegram',
    });
    await provider.addOrUpdateSocial({
      type: 'custom',
      value: 'https://x.com/vanblog',
      label: 'Twitter / X',
    });
    const firstId = (await provider.getSocials())[0].id;

    await provider.addOrUpdateSocial({
      type: 'custom',
      id: firstId,
      value: 'https://t.me/new',
      label: 'TG',
      icon: 'https://example.com/tg.png',
    });

    const socials = await provider.getSocials();
    expect(socials).toHaveLength(2);
    expect(socials[0]).toEqual(
      expect.objectContaining({
        id: firstId,
        label: 'TG',
        value: 'https://t.me/new',
        icon: 'https://example.com/tg.png',
      }),
    );
    expect(socials[1].label).toBe('Twitter / X');
  });

  it('deletes one custom contact by id and leaves builtins and other customs', async () => {
    const { provider } = createProvider();
    await provider.addOrUpdateSocial({ type: 'github', value: 'https://github.com/Mereithhh' });
    await provider.addOrUpdateSocial({
      type: 'custom',
      value: 'https://t.me/vanblog',
      label: 'Telegram',
    });
    await provider.addOrUpdateSocial({
      type: 'custom',
      value: 'https://x.com/vanblog',
      label: 'Twitter / X',
    });
    const telegramId = (await provider.getSocials()).find((s) => s.label === 'Telegram')?.id;

    await provider.deleteSocial(telegramId as any);
    const socials = await provider.getSocials();
    expect(socials.map((s) => s.type)).toEqual(['github', 'custom']);
    expect(socials.find((s) => s.label === 'Telegram')).toBeUndefined();
    expect(socials.find((s) => s.label === 'Twitter / X')?.value).toBe('https://x.com/vanblog');

    await provider.deleteSocial('github');
    expect((await provider.getSocials()).map((s) => s.type)).toEqual(['custom']);
  });

  it('lists 自定义 among social types', async () => {
    const { provider } = createProvider();
    const types = await provider.getSocialTypes();
    expect(types).toEqual(
      expect.arrayContaining([
        { label: 'GitHub', value: 'github' },
        { label: '自定义', value: 'custom' },
      ]),
    );
  });
});
