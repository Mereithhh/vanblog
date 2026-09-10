import {
  applyCategoryNameOrder,
  categoryOrderValue,
  nextCategoryOrder,
  sortCategoriesByOrder,
} from './categoryOrder';

describe('categoryOrder (#152)', () => {
  it('sorts by explicit order then id, and treats missing order as id', () => {
    const docs = [
      { id: 3, name: 'Python' },
      { id: 1, name: '深度学习', order: 2 },
      { id: 2, name: 'Linux运维', order: 0 },
    ];
    expect(sortCategoriesByOrder(docs).map((item) => item.name)).toEqual([
      'Linux运维',
      '深度学习',
      'Python',
    ]);
    expect(categoryOrderValue({ id: 4 })).toBe(4);
    expect(nextCategoryOrder(docs)).toBe(4);
  });

  it('applies a name list and appends omitted categories in previous order', () => {
    const docs = [
      { id: 1, name: '深度学习', order: 0 },
      { id: 2, name: 'Linux运维', order: 1 },
      { id: 3, name: '单片机', hidden: true, order: 2 },
      { id: 4, name: 'Python', order: 3 },
    ];
    expect(applyCategoryNameOrder(docs, ['Linux运维', '深度学习', 'missing'])).toEqual([
      { name: 'Linux运维', order: 0 },
      { name: '深度学习', order: 1 },
      { name: '单片机', order: 2 },
      { name: 'Python', order: 3 },
    ]);
  });
});
