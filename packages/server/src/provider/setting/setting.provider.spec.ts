import { SettingProvider } from './setting.provider';

function createMemorySettingModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => docs.find((item) => item.type === query?.type) || null;
  return {
    docs,
    findOne: jest.fn((query: any) => ({
      exec: async () => findMatching(query),
    })),
    create: jest.fn(async (doc: any) => {
      const created = { ...doc };
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

describe('SettingProvider waline forceLoginComment', () => {
  it('persists string "true" from the admin select as boolean true', async () => {
    const model = createMemorySettingModel();
    const provider = new SettingProvider(model as any, {} as any, {} as any);

    await provider.updateWalineSetting({ forceLoginComment: 'true' } as any);
    const saved = await provider.getWalineSetting();
    expect(saved.forceLoginComment).toBe(true);
    expect(model.docs[0].value.forceLoginComment).toBe(true);
  });

  it('reads a previously stored string "true" as enabled', async () => {
    const model = createMemorySettingModel([
      { type: 'waline', value: { forceLoginComment: 'true', 'smtp.enabled': false } },
    ]);
    const provider = new SettingProvider(model as any, {} as any, {} as any);
    expect((await provider.getWalineSetting()).forceLoginComment).toBe(true);
  });

  it('keeps force login off when the toggle is false', async () => {
    const model = createMemorySettingModel();
    const provider = new SettingProvider(model as any, {} as any, {} as any);
    await provider.updateWalineSetting({ forceLoginComment: false } as any);
    expect((await provider.getWalineSetting()).forceLoginComment).toBe(false);
  });
});
