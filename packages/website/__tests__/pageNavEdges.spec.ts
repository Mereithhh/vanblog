import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  PAGE_NAV_NEXT_LABEL,
  PAGE_NAV_PREV_LABEL,
  describePageNav,
} from "../components/PageNav/a11y";
import { pageNavControlClass } from "../components/PageNav/classes";
import { calItemList, PageNavProps } from "../components/PageNav/core";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const itemsOf = (
  overrides: Partial<PageNavProps> & Pick<PageNavProps, "total" | "current">
) =>
  calItemList({
    base: "/",
    more: "/page",
    ...overrides,
  });

const edgesOf = (
  overrides: Partial<PageNavProps> & Pick<PageNavProps, "total" | "current">
) => {
  const nodes = describePageNav(itemsOf(overrides));
  return {
    prev: nodes.find((node) => node.type === "pre-btn" || node.type === "pre-btn-disable"),
    next: nodes.find((node) => node.type === "next-btn" || node.type === "next-btn-disable"),
    current: nodes.find((node) => node.type === "link-cur"),
    numbered: nodes.filter((node) => node.type === "link" || node.type === "link-cur"),
  };
};

describe("PageNav first/last edges (#331)", () => {
  it("first page: prev is disabled and not navigable; next stays a link", () => {
    const { prev, next, current } = edgesOf({ total: 15, current: 1 });
    expect(prev).toMatchObject({
      kind: "disabled",
      type: "pre-btn-disable",
      focusable: false,
      ariaDisabled: true,
      ariaLabel: PAGE_NAV_PREV_LABEL,
    });
    expect(prev?.href).toBeUndefined();
    expect(next).toMatchObject({
      kind: "link",
      type: "next-btn",
      href: "/page/2",
      focusable: true,
      ariaLabel: PAGE_NAV_NEXT_LABEL,
    });
    expect(next?.ariaDisabled).toBeUndefined();
    expect(current).toMatchObject({ page: 1, ariaCurrent: "page" });
  });

  it("last page: next is disabled and not navigable; prev stays a link", () => {
    const { prev, next, current } = edgesOf({ total: 15, current: 3 });
    expect(next).toMatchObject({
      kind: "disabled",
      type: "next-btn-disable",
      focusable: false,
      ariaDisabled: true,
      ariaLabel: PAGE_NAV_NEXT_LABEL,
    });
    expect(next?.href).toBeUndefined();
    expect(prev).toMatchObject({
      kind: "link",
      type: "pre-btn",
      href: "/page/2",
      focusable: true,
      ariaLabel: PAGE_NAV_PREV_LABEL,
    });
    expect(prev?.ariaDisabled).toBeUndefined();
    expect(current).toMatchObject({ page: 3, ariaCurrent: "page" });
  });

  it("middle page: prev and next are both enabled links", () => {
    const { prev, next, current } = edgesOf({ total: 15, current: 2 });
    expect(prev).toMatchObject({
      kind: "link",
      type: "pre-btn",
      href: "/",
      focusable: true,
    });
    expect(next).toMatchObject({
      kind: "link",
      type: "next-btn",
      href: "/page/3",
      focusable: true,
    });
    expect(prev?.ariaDisabled).toBeUndefined();
    expect(next?.ariaDisabled).toBeUndefined();
    expect(current).toMatchObject({ page: 2, ariaCurrent: "page" });
  });

  it("keeps numbered page links on every page, including the edges", () => {
    for (const current of [1, 2, 3]) {
      const { numbered } = edgesOf({ total: 15, current });
      expect(numbered.map((node) => node.page)).toEqual([1, 2, 3]);
      expect(numbered.filter((node) => node.ariaCurrent === "page")).toHaveLength(1);
      expect(numbered.find((node) => node.ariaCurrent === "page")?.page).toBe(current);
      for (const node of numbered) {
        expect(node.kind).toBe("link");
        expect(node.href).toBe(node.page === 1 ? "/" : `/page/${node.page}`);
      }
    }
  });

  it("respects articles-per-page when deciding the last page (#346)", () => {
    const last = edgesOf({ total: 20, current: 4, pageSize: 5 });
    expect(last.next).toMatchObject({ kind: "disabled", type: "next-btn-disable" });
    expect(last.next?.href).toBeUndefined();
    expect(last.prev).toMatchObject({ kind: "link", href: "/page/3" });

    const stillMiddle = edgesOf({ total: 20, current: 3, pageSize: 5 });
    expect(stillMiddle.prev?.kind).toBe("link");
    expect(stillMiddle.next?.kind).toBe("link");
    expect(stillMiddle.next?.href).toBe("/page/4");
  });
});

describe("PageNav edge markup (#331)", () => {
  const render = readSrc("components/PageNav/render.tsx");

  it("renders disabled prev/next as aria-disabled spans, not Links", () => {
    expect(render).toMatch(/if \(node\.kind === "disabled"\)/);
    expect(render).toMatch(/aria-disabled="true"/);
    expect(render).toMatch(/pageNavControlClass\(true\)/);
    expect(render).toMatch(/<span aria-disabled="true" aria-label=\{node\.ariaLabel\}>/);
    const disabledBlock = render.slice(
      render.indexOf('if (node.kind === "disabled")'),
      render.indexOf("const innerClass")
    );
    expect(disabledBlock).toMatch(/<span/);
    expect(disabledBlock).not.toMatch(/<Link/);
    expect(disabledBlock).not.toMatch(/href/);
  });

  it("keeps enabled prev/next as Links with href", () => {
    expect(render).toMatch(/<Link[\s\S]*href=\{node\.href as string\}/);
    expect(pageNavControlClass(true)).not.toMatch(/hover:/);
    expect(pageNavControlClass(false)).toMatch(/hover:bg-gray-200/);
  });
});
