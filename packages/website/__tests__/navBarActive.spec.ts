import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { defaultMenu, MenuItem } from "../api/getAllData";
import {
  describeNavItem,
  describeNavLink,
  describeNavMenu,
  isExternalNavHref,
  isHomeListingPath,
  isNavHrefActive,
  NAV_ITEM_CURRENT_CLASS,
  NAV_ITEM_CURRENT_FILL_CLASS,
  normalizeNavPath,
  SIDE_BAR_ITEM_CURRENT_CLASS,
  withNavCurrentClass,
} from "../components/NavBar/active";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

describe("normalizeNavPath", () => {
  it("strips query, hash, trailing slash, and origin", () => {
    expect(normalizeNavPath("/tag/?x=1#top")).toBe("/tag");
    expect(normalizeNavPath("/tag/")).toBe("/tag");
    expect(normalizeNavPath("/")).toBe("/");
    expect(normalizeNavPath("https://example.com/about")).toBe("/about");
    expect(normalizeNavPath("/category/C%2B%2B")).toBe("/category/C++");
  });
});

describe("isNavHrefActive / aria-current", () => {
  it("marks home on / and /page/n, not on other routes", () => {
    expect(isHomeListingPath("/")).toBe(true);
    expect(isHomeListingPath("/page/2")).toBe(true);
    expect(isHomeListingPath("/page/2/")).toBe(true);
    expect(isNavHrefActive("/", "/")).toBe(true);
    expect(isNavHrefActive("/", "/page/3")).toBe(true);
    expect(isNavHrefActive("/", "/tag")).toBe(false);
    expect(isNavHrefActive("/", "/post/1")).toBe(false);
    expect(isNavHrefActive("/", "/page")).toBe(false);

    const home = describeNavLink("/", "/page/2");
    expect(home.current).toBe(true);
    expect(home.ariaCurrent).toBe("page");
    expect(home.currentClass).toBe(NAV_ITEM_CURRENT_CLASS);

    const homeOnTag = describeNavLink("/", "/tag");
    expect(homeOnTag.current).toBe(false);
    expect(homeOnTag.ariaCurrent).toBeUndefined();
    expect(homeOnTag.currentClass).toBe("");
  });

  it("uses a path-prefix boundary so /tag matches /tag/js but /about does not match /about-me", () => {
    expect(isNavHrefActive("/tag", "/tag")).toBe(true);
    expect(isNavHrefActive("/tag", "/tag/javascript")).toBe(true);
    expect(isNavHrefActive("/category", "/category/foo")).toBe(true);
    expect(isNavHrefActive("/about", "/about")).toBe(true);
    expect(isNavHrefActive("/about", "/about-me")).toBe(false);
    expect(isNavHrefActive("/ta", "/tag")).toBe(false);
    expect(isNavHrefActive("/timeline", "/tag")).toBe(false);
  });

  it("never marks external http(s) links as the current page", () => {
    expect(isExternalNavHref("https://github.com/Mereithhh/vanblog")).toBe(
      true
    );
    expect(isNavHrefActive("https://github.com/Mereithhh/vanblog", "/")).toBe(
      false
    );
    const link = describeNavLink("https://example.com", "/");
    expect(link.current).toBe(false);
    expect(link.ariaCurrent).toBeUndefined();
  });

  it("gives inactive items no selected class and no aria-current", () => {
    const tagOnHome = describeNavLink("/tag", "/");
    expect(tagOnHome.current).toBe(false);
    expect(tagOnHome.ariaCurrent).toBeUndefined();
    expect(tagOnHome.currentClass).toBe("");
    expect(withNavCurrentClass("nav-item ua", false)).toBe("nav-item ua");
    expect(withNavCurrentClass("nav-item ua", true)).toContain(
      NAV_ITEM_CURRENT_CLASS
    );
    expect(withNavCurrentClass("side-bar-item", true, "sidebar")).toContain(
      SIDE_BAR_ITEM_CURRENT_CLASS
    );
    expect(
      withNavCurrentClass("dropdown", true, "fill")
    ).toContain(NAV_ITEM_CURRENT_FILL_CLASS);
  });
});

describe("default menu selected state", () => {
  it("marks exactly one top-level item as aria-current=page on each default route", () => {
    const cases: Array<{ path: string; name: string }> = [
      { path: "/", name: "首页" },
      { path: "/page/2", name: "首页" },
      { path: "/tag", name: "标签" },
      { path: "/tag/js", name: "标签" },
      { path: "/category", name: "分类" },
      { path: "/category/随笔", name: "分类" },
      { path: "/timeline", name: "时间线" },
      { path: "/link", name: "友链" },
      { path: "/about", name: "关于" },
    ];
    for (const { path: currentPath, name } of cases) {
      const items = describeNavMenu(defaultMenu, currentPath);
      const current = items.filter((item) => item.ariaCurrent === "page");
      expect(current).toHaveLength(1);
      expect(current[0].name).toBe(name);
      expect(current[0].current).toBe(true);
      expect(current[0].currentClass).toBe(NAV_ITEM_CURRENT_CLASS);
      for (const item of items) {
        if (item.name !== name) {
          expect(item.current).toBe(false);
          expect(item.ariaCurrent).toBeUndefined();
          expect(item.currentClass).toBe("");
        }
      }
    }
  });

  it("does not mark any default item on a post page", () => {
    const items = describeNavMenu(defaultMenu, "/post/hello");
    expect(items.every((item) => item.current === false)).toBe(true);
    expect(items.every((item) => item.ariaCurrent === undefined)).toBe(true);
  });
});

describe("nested custom menu", () => {
  const nested: MenuItem[] = [
    { id: 0, name: "首页", value: "/", level: 0 },
    {
      id: 1,
      name: "分类",
      value: "/category",
      level: 0,
      children: [
        { id: 11, name: "随笔", value: "/category/随笔", level: 1 },
        { id: 12, name: "技术", value: "/category/技术", level: 1 },
      ],
    },
  ];

  it("puts aria-current on the child and only a visual selected state on the parent", () => {
    const [home, category] = describeNavMenu(nested, "/category/技术");
    expect(home.current).toBe(false);
    expect(home.ariaCurrent).toBeUndefined();

    expect(category.current).toBe(true);
    expect(category.ariaCurrent).toBeUndefined();
    expect(category.currentClass).toBe(NAV_ITEM_CURRENT_CLASS);

    const children = category.children ?? [];
    expect(children[0].current).toBe(false);
    expect(children[0].ariaCurrent).toBeUndefined();
    expect(children[0].currentClass).toBe("");
    expect(children[1].current).toBe(true);
    expect(children[1].ariaCurrent).toBe("page");
    expect(children[1].currentClass).toBe(NAV_ITEM_CURRENT_FILL_CLASS);
  });

  it("keeps aria-current on the parent when no child is a better match", () => {
    const category = describeNavItem(nested[1], "/category");
    expect(category.current).toBe(true);
    expect(category.ariaCurrent).toBe("page");
    expect(category.children?.every((c) => c.current === false)).toBe(true);
  });
});

describe("category submenu links", () => {
  it("selects only the matching category", () => {
    const current = describeNavLink("/category/随笔", "/category/随笔");
    const other = describeNavLink("/category/技术", "/category/随笔");
    expect(current.ariaCurrent).toBe("page");
    expect(current.current).toBe(true);
    expect(other.current).toBe(false);
    expect(other.ariaCurrent).toBeUndefined();
  });
});

describe("nav selected-state markup", () => {
  const item = readSrc("components/NavBar/item.tsx");
  const nav = readSrc("components/NavBar/index.tsx");
  const mobile = readSrc("components/NavBarMobile/index.tsx");
  const css = readSrc("styles/globals.css");

  it("wires desktop items, category submenu, and mobile sidebar to the shared model", () => {
    expect(item).toMatch(/describeNavItem/);
    expect(item).toMatch(/aria-current=\{state\.ariaCurrent\}/);
    expect(item).toMatch(/withNavCurrentClass/);
    expect(item).toMatch(/currentPath/);

    expect(nav).toMatch(/currentPath=\{asPath\}/);
    expect(nav).toMatch(/describeNavLink/);
    expect(nav).toMatch(/aria-current=\{state\.ariaCurrent\}/);
    expect(nav).toMatch(/withNavCurrentClass/);

    expect(mobile).toMatch(/describeNavMenu/);
    expect(mobile).toMatch(/aria-current=\{state\.ariaCurrent\}/);
    expect(mobile).toMatch(/withNavCurrentClass/);
    expect(mobile).toMatch(/"sidebar"/);
  });

  it("defines distinct current styles for light and dark themes", () => {
    expect(css).toMatch(/\.nav-item-current/);
    expect(css).toMatch(/\.nav-item-current-fill/);
    expect(css).toMatch(/\.side-bar-item-current/);
    expect(css).toMatch(/dark:text-dark-hover/);
    expect(css).toMatch(/\.nav-item-current\.ua:before/);
    expect(NAV_ITEM_CURRENT_CLASS).toBe("nav-item-current");
    expect(NAV_ITEM_CURRENT_FILL_CLASS).toBe("nav-item-current-fill");
    expect(SIDE_BAR_ITEM_CURRENT_CLASS).toBe("side-bar-item-current");
  });
});
