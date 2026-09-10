/** Public category-list page: collapsed by default, matching the previous hardcoded UI. */
export const DEFAULT_EXPAND_ALL_CATEGORIES = false;

export const CATEGORY_EXPAND_ALL_LABEL = "全部展开";
export const CATEGORY_COLLAPSE_ALL_LABEL = "全部收起";

/** Collapsed disclosure mark; CSS rotate-90 turns it into a downward "V". */
export const CATEGORY_EXPAND_CHEVRON = ">";

export function isDefaultExpandAllCategories(value: unknown): boolean {
  return value === true || value === "true";
}

export function initialCategoryOpenMap(
  names: string[],
  defaultExpandAll: boolean
): Record<string, boolean> {
  return Object.fromEntries(names.map((name) => [name, defaultExpandAll]));
}

export function setAllCategoryOpen(
  names: string[],
  open: boolean
): Record<string, boolean> {
  return Object.fromEntries(names.map((name) => [name, open]));
}

export function toggleCategoryOpen(
  map: Record<string, boolean>,
  name: string
): Record<string, boolean> {
  return { ...map, [name]: !Boolean(map[name]) };
}

export function nextOpenState(open: boolean): boolean {
  return !open;
}

export function expandControlIcon(open: boolean): string {
  return CATEGORY_EXPAND_CHEVRON;
}

export function expandControlAriaExpanded(open: boolean): "true" | "false" {
  return open ? "true" : "false";
}
