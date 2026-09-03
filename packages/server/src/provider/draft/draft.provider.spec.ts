import { BadRequestException } from '@nestjs/common';
import { DraftProvider } from './draft.provider';

class CastError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CastError';
  }
}

function assertQueryId(id: unknown) {
  if (typeof id === 'number' && Number.isNaN(id)) {
    throw new CastError(
      'Cast to Number failed for value "NaN" (type number) at path "id" for model "Draft"',
    );
  }
}

function createMemoryDraftModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => {
    assertQueryId(query?.id);
    return (
      docs.find((item) => {
        if (query?.id != null && item.id !== query.id) {
          return false;
        }
        if (query?.deleted === false && item.deleted) {
          return false;
        }
        return true;
      }) || null
    );
  };
  return {
    docs,
    findOne: jest.fn(async (query: any) => findMatching(query)),
    updateOne: jest.fn(async (query: any, patch: any) => {
      assertQueryId(query?.id);
      const target = findMatching(query);
      if (!target) {
        return { modifiedCount: 0 };
      }
      Object.assign(target, patch);
      return { modifiedCount: 1 };
    }),
  };
}

describe('DraftProvider getById/updateById (#427)', () => {
  const original = {
    id: 7,
    title: '六月四号的草稿',
    content: '<!-- more -->\n正文还在',
    deleted: false,
    tags: ['draft'],
    category: '随笔',
  };

  it('round-trips a valid draft without wiping content', async () => {
    const model = createMemoryDraftModel([{ ...original }]);
    const provider = new DraftProvider(model as any, {} as any);

    const loaded = await provider.getById(7);
    expect(loaded.content).toBe(original.content);

    await provider.updateById(7, { content: '<!-- more -->\n第二天还能打开' });
    const updated = await provider.getById('7');
    expect(updated.content).toBe('<!-- more -->\n第二天还能打开');
    expect(updated.id).toBe(7);
  });

  it('does not query mongoose with NaN or wipe the draft on invalid get/update', async () => {
    const model = createMemoryDraftModel([{ ...original }]);
    const provider = new DraftProvider(model as any, {} as any);

    await expect(provider.getById(NaN)).rejects.toBeInstanceOf(BadRequestException);
    await expect(provider.getById(undefined as any)).rejects.toBeInstanceOf(BadRequestException);
    await expect(provider.findById('undefined')).rejects.toBeInstanceOf(BadRequestException);
    await expect(provider.updateById(NaN, { content: '' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(provider.updateById('NaN', { content: '' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(model.findOne).not.toHaveBeenCalled();
    expect(model.updateOne).not.toHaveBeenCalled();
    expect(model.docs[0].content).toBe(original.content);
  });
});
