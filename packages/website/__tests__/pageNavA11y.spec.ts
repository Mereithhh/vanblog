import { describe, expect, it } from "vitest";
import {
  PAGE_NAV_ITEM_ATTR,
  PAGE_NAV_LABEL,
  PAGE_NAV_NEXT_LABEL,
  PAGE_NAV_PREV_LABEL,
  describePageNav,
  focusablePageNavNodes,
  handlePageNavKeyDown,
  movePageNavFocusIndex,
} from "../components/PageNav/a11y";
import { calItemList, PageNavProps } from "../components/PageNav/core";

const itemsOf = (
  overrides: Partial<PageNavProps> & Pick<PageNavProps, "total" | "current">
) =>
  calItemList({
    base: "/",
    more: "/page",
    ...overrides,
  });

describe("PageNav a11y render model", () => {
  it("does not expose ellipsis as a navigational link or focus target", () => {
    const nodes = describePageNav(itemsOf({ total: 50, current: 6 }));
    const ellipsis = nodes.filter((node) => node.kind === "ellipsis");
    expect(ellipsis).toHaveLength(2);
    for (const node of ellipsis) {
      expect(node.href).toBeUndefined();
      expect(node.focusable).toBe(false);
      expect(node.ariaHidden).toBe(true);
      expect(node.content).toBe("•••");
    }
    expect(nodes.some((node) => node.kind === "ellipsis" && node.href)).toBe(
      false
    );
  });

  it("renders a single-side ellipsis without href on the start pattern", () => {
    const nodes = describePageNav(itemsOf({ total: 50, current: 2 }));
    const ellipsis = nodes.filter((node) => node.kind === "ellipsis");
    expect(ellipsis).toHaveLength(1);
    expect(ellipsis[0].type).toBe("next-more");
    expect(ellipsis[0].href).toBeUndefined();
    expect(ellipsis[0].focusable).toBe(false);
  });

  it("makes disabled prev/next spans, not focusable links", () => {
    const first = describePageNav(itemsOf({ total: 15, current: 1 }));
    const last = describePageNav(itemsOf({ total: 15, current: 3 }));

    const disabledPrev = first.find((node) => node.type === "pre-btn-disable");
    const disabledNext = last.find((node) => node.type === "next-btn-disable");

    expect(disabledPrev).toMatchObject({
      kind: "disabled",
      focusable: false,
      ariaDisabled: true,
      ariaLabel: PAGE_NAV_PREV_LABEL,
    });
    expect(disabledNext).toMatchObject({
      kind: "disabled",
      focusable: false,
      ariaDisabled: true,
      ariaLabel: PAGE_NAV_NEXT_LABEL,
    });
    expect(disabledPrev?.href).toBeUndefined();
    expect(disabledNext?.href).toBeUndefined();
    expect(first.some((node) => node.type === "pre-btn-disable" && node.href)).toBe(
      false
    );
    expect(last.some((node) => node.type === "next-btn-disable" && node.href)).toBe(
      false
    );
  });

  it("gives enabled prev/next accessible names and real hrefs", () => {
    const nodes = describePageNav(itemsOf({ total: 15, current: 2 }));
    const prev = nodes.find((node) => node.type === "pre-btn");
    const next = nodes.find((node) => node.type === "next-btn");
    expect(prev).toMatchObject({
      kind: "link",
      href: "/",
      focusable: true,
      ariaLabel: PAGE_NAV_PREV_LABEL,
    });
    expect(next).toMatchObject({
      kind: "link",
      href: "/page/3",
      focusable: true,
      ariaLabel: PAGE_NAV_NEXT_LABEL,
    });
  });

  it("keeps aria-current=page on the current page link only", () => {
    const nodes = describePageNav(itemsOf({ total: 50, current: 6 }));
    const current = nodes.filter((node) => node.ariaCurrent === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toMatchObject({
      kind: "link",
      type: "link-cur",
      page: 6,
      href: "/page/6",
      focusable: true,
    });
    expect(nodes.filter((node) => node.type === "link-cur")).toHaveLength(1);
  });

  it("skips ellipsis and disabled controls in the focusable set", () => {
    const start = focusablePageNavNodes(itemsOf({ total: 50, current: 1 }));
    expect(start.map((node) => node.type)).toEqual([
      "link-cur",
      "link",
      "link",
      "link",
      "link",
      "next-btn",
    ]);
    expect(start.every((node) => node.kind === "link" && node.href)).toBe(true);
    expect(start.some((node) => node.kind === "ellipsis")).toBe(false);
    expect(start.some((node) => node.kind === "disabled")).toBe(false);

    const mid = focusablePageNavNodes(itemsOf({ total: 50, current: 6 }));
    expect(mid.map((node) => [node.type, node.page])).toEqual([
      ["pre-btn", 5],
      ["link", 1],
      ["link", 5],
      ["link-cur", 6],
      ["link", 7],
      ["link", 10],
      ["next-btn", 7],
    ]);
  });
});

describe("PageNav arrow-key focus", () => {
  it("moves one focusable control at a time and does not wrap", () => {
    expect(movePageNavFocusIndex(5, 2, "ArrowLeft")).toBe(1);
    expect(movePageNavFocusIndex(5, 2, "ArrowRight")).toBe(3);
    expect(movePageNavFocusIndex(5, 0, "ArrowLeft")).toBe(0);
    expect(movePageNavFocusIndex(5, 4, "ArrowRight")).toBe(4);
    expect(movePageNavFocusIndex(0, 0, "ArrowRight")).toBe(-1);
  });

  it("ArrowLeft / ArrowRight move among focusable controls via the shared handler", () => {
    const focused: number[] = [];
    const items = [0, 1, 2].map((i) => ({
      id: i,
      focus: () => {
        focused.push(i);
      },
    }));
    const currentTarget = {
      querySelectorAll: (selector: string) => {
        expect(selector).toBe(`[${PAGE_NAV_ITEM_ATTR}]`);
        return items;
      },
    };

    let active = items[1];
    const fire = (key: string) => {
      let prevented = false;
      return handlePageNavKeyDown({
        key,
        currentTarget,
        target: active,
        preventDefault: () => {
          prevented = true;
        },
      });
    };

    expect(fire("ArrowLeft")).toBe(0);
    expect(focused).toEqual([0]);
    active = items[0];
    expect(fire("ArrowLeft")).toBe(0);
    expect(focused).toEqual([0]);

    expect(fire("ArrowRight")).toBe(1);
    active = items[1];
    expect(fire("ArrowRight")).toBe(2);
    active = items[2];
    expect(fire("ArrowRight")).toBe(2);
    expect(focused).toEqual([0, 1, 2]);

    expect(fire("ArrowUp")).toBeNull();
    expect(fire("Enter")).toBeNull();
  });

  it("uses Pagination landmark labels from the shared helpers", () => {
    expect(PAGE_NAV_LABEL).toBe("Pagination");
    expect(PAGE_NAV_PREV_LABEL).toBe("Previous page");
    expect(PAGE_NAV_NEXT_LABEL).toBe("Next page");
    expect(PAGE_NAV_ITEM_ATTR).toBe("data-page-nav-item");
  });
});
