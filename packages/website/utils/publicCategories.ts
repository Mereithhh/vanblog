/**
 * Public meta.categories is already filtered server-side.
 * A category page / nav item is listed only when its name is in that list.
 */
export function isListedPublicCategory(
  name: string | undefined | null,
  categories: string[] | undefined | null,
): boolean {
  if (!name || !Array.isArray(categories)) {
    return false;
  }
  return categories.includes(name);
}

export function listedPublicCategories(
  categories: string[] | undefined | null,
): string[] {
  return Array.isArray(categories) ? categories.slice() : [];
}
