export type CategoryOrderLike = {
  name?: string;
  order?: number;
  id?: number;
};

export function categoryOrderValue(doc: CategoryOrderLike | null | undefined): number {
  if (typeof doc?.order === 'number' && Number.isFinite(doc.order)) {
    return doc.order;
  }
  // Legacy rows without order keep creation / numeric id sequence.
  if (typeof doc?.id === 'number' && Number.isFinite(doc.id)) {
    return doc.id;
  }
  return Number.MAX_SAFE_INTEGER;
}

export function compareCategoriesByOrder(a: CategoryOrderLike, b: CategoryOrderLike): number {
  const byOrder = categoryOrderValue(a) - categoryOrderValue(b);
  if (byOrder !== 0) {
    return byOrder;
  }
  const aId = typeof a?.id === 'number' && Number.isFinite(a.id) ? a.id : 0;
  const bId = typeof b?.id === 'number' && Number.isFinite(b.id) ? b.id : 0;
  if (aId !== bId) {
    return aId - bId;
  }
  return String(a?.name || '').localeCompare(String(b?.name || ''), 'zh');
}

export function sortCategoriesByOrder<T extends CategoryOrderLike>(list: T[] | null | undefined): T[] {
  if (!list || !list.length) {
    return [];
  }
  return [...list].sort(compareCategoriesByOrder);
}

export function nextCategoryOrder(docs: CategoryOrderLike[] | null | undefined): number {
  if (!docs || !docs.length) {
    return 0;
  }
  return Math.max(...docs.map(categoryOrderValue)) + 1;
}

/**
 * Assign dense 0..n-1 order values from a desired name list.
 * Unknown names are ignored. Categories missing from `names` keep
 * their previous relative order after the named ones.
 */
export function applyCategoryNameOrder(
  docs: CategoryOrderLike[] | null | undefined,
  names: string[] | null | undefined,
): Array<{ name: string; order: number }> {
  const byName = new Map<string, CategoryOrderLike>();
  for (const doc of docs || []) {
    if (typeof doc?.name === 'string' && doc.name && !byName.has(doc.name)) {
      byName.set(doc.name, doc);
    }
  }
  const seen = new Set<string>();
  const ordered: CategoryOrderLike[] = [];
  for (const name of names || []) {
    if (typeof name !== 'string' || !name || seen.has(name)) {
      continue;
    }
    const doc = byName.get(name);
    if (!doc) {
      continue;
    }
    seen.add(name);
    ordered.push(doc);
  }
  const rest = sortCategoriesByOrder(
    [...byName.values()].filter((doc) => doc.name && !seen.has(doc.name)),
  );
  return [...ordered, ...rest].map((doc, index) => ({
    name: String(doc.name),
    order: index,
  }));
}
