import { MenuItem } from "../../api/getAllData";

/** Desktop top-level / category current item: darker text + persistent underline. */
export const NAV_ITEM_CURRENT_CLASS = "nav-item-current";

/** Dropdown child current item: filled chip, no underline. */
export const NAV_ITEM_CURRENT_FILL_CLASS = "nav-item-current-fill";

/** Mobile sidebar current item. */
export const SIDE_BAR_ITEM_CURRENT_CLASS = "side-bar-item-current";

export type NavAriaCurrent = "page";

export type NavLinkState = {
  href: string;
  current: boolean;
  ariaCurrent?: NavAriaCurrent;
  currentClass: string;
};

export type NavItemState = NavLinkState & {
  name: string;
  children?: NavItemState[];
};

/**
 * Strip origin, query, hash, and a trailing slash so `/tag/` and
 * `/tag?x=1` compare equal to a menu href of `/tag`.
 */
export function normalizeNavPath(path: string): string {
  let p = (path || "").trim();
  if (!p) {
    return "/";
  }
  if (/^https?:\/\//i.test(p) || p.startsWith("//")) {
    try {
      const url = new URL(p, "http://localhost");
      p = url.pathname || "/";
    } catch {
      // keep the raw path
    }
  }
  const q = p.indexOf("?");
  if (q >= 0) {
    p = p.slice(0, q);
  }
  const h = p.indexOf("#");
  if (h >= 0) {
    p = p.slice(0, h);
  }
  if (!p.startsWith("/")) {
    p = `/${p}`;
  }
  try {
    p = decodeURIComponent(p);
  } catch {
    // keep the encoded path
  }
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p || "/";
}

/** Same split the nav uses: values containing "http" render as external `<a>`. */
export function isExternalNavHref(href: string): boolean {
  return (href || "").includes("http");
}

/** Home listing pages: `/` and `/page/n`. */
export function isHomeListingPath(path: string): boolean {
  const current = normalizeNavPath(path);
  return current === "/" || /^\/page\/\d+$/.test(current);
}

/**
 * Whether this href is the current public route.
 * Exact match, home listing (`/` on `/page/n`), or a path-prefix with a `/`
 * boundary (`/tag` matches `/tag/js`, `/about` does not match `/about-me`).
 */
export function isNavHrefActive(href: string, currentPath: string): boolean {
  if (!href || isExternalNavHref(href)) {
    return false;
  }
  const item = normalizeNavPath(href);
  const current = normalizeNavPath(currentPath);
  if (item === "/") {
    return isHomeListingPath(current);
  }
  if (current === item) {
    return true;
  }
  return current.startsWith(`${item}/`);
}

export function withNavCurrentClass(
  base: string,
  current: boolean,
  variant: "underline" | "fill" | "sidebar" = "underline"
): string {
  if (!current) {
    return base;
  }
  if (variant === "sidebar") {
    return `${base} ${SIDE_BAR_ITEM_CURRENT_CLASS}`;
  }
  if (variant === "fill") {
    return `${base} ${NAV_ITEM_CURRENT_FILL_CLASS}`;
  }
  return `${base} ${NAV_ITEM_CURRENT_CLASS}`;
}

export function describeNavLink(
  href: string,
  currentPath: string,
  variant: "underline" | "fill" | "sidebar" = "underline"
): NavLinkState {
  const current = isNavHrefActive(href, currentPath);
  return {
    href,
    current,
    ariaCurrent: current ? "page" : undefined,
    currentClass: withNavCurrentClass("", current, variant).trim(),
  };
}

/**
 * Visual selected = this href matches, or a descendant does.
 * `aria-current="page"` stays on the most specific matching item (a child
 * exact/prefix match wins over a parent prefix match).
 */
export function describeNavItem(
  item: MenuItem,
  currentPath: string,
  variant: "underline" | "fill" | "sidebar" = "underline"
): NavItemState {
  const childVariant: "underline" | "fill" | "sidebar" =
    variant === "sidebar" ? "sidebar" : "fill";
  const children = item.children?.map((child) =>
    describeNavItem(child, currentPath, childVariant)
  );
  const selfHrefActive = isNavHrefActive(item.value, currentPath);
  const childCurrent = children?.some((child) => child.current) ?? false;
  const childHasPage =
    children?.some((child) => child.ariaCurrent === "page") ?? false;
  const current = selfHrefActive || childCurrent;
  const ariaCurrent: NavAriaCurrent | undefined =
    selfHrefActive && !childHasPage ? "page" : undefined;
  return {
    href: item.value,
    name: item.name,
    current,
    ariaCurrent,
    currentClass: withNavCurrentClass("", current, variant).trim(),
    children,
  };
}

export function describeNavMenu(
  items: MenuItem[],
  currentPath: string,
  variant: "underline" | "fill" | "sidebar" = "underline"
): NavItemState[] {
  return items.map((item) => describeNavItem(item, currentPath, variant));
}
