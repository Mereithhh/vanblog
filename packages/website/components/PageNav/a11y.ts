import { PageItem, PageItemType } from "./core";

/** Landmark name for the public pagination `<nav>`. */
export const PAGE_NAV_LABEL = "Pagination";
export const PAGE_NAV_PREV_LABEL = "Previous page";
export const PAGE_NAV_NEXT_LABEL = "Next page";

/** Marks focusable page / prev / next controls for ArrowLeft / ArrowRight. */
export const PAGE_NAV_ITEM_ATTR = "data-page-nav-item";

export type PageNavNodeKind = "link" | "disabled" | "ellipsis";

export type PageNavNode = {
  kind: PageNavNodeKind;
  type: PageItemType;
  page: number;
  content: string;
  href?: string;
  ariaLabel?: string;
  ariaCurrent?: "page";
  ariaDisabled?: boolean;
  ariaHidden?: boolean;
  focusable: boolean;
};

export const isEllipsisType = (type: PageItemType) =>
  type === "pre-more" || type === "next-more";

export const isDisabledControlType = (type: PageItemType) =>
  type === "pre-btn-disable" || type === "next-btn-disable";

export const isPrevType = (type: PageItemType) =>
  type === "pre-btn" || type === "pre-btn-disable";

export const isNextType = (type: PageItemType) =>
  type === "next-btn" || type === "next-btn-disable";

/**
 * Shared render model for PageNav cells.
 * Ellipsis and disabled prev/next are never navigational links.
 */
export function describePageNavNode(item: PageItem): PageNavNode {
  if (isEllipsisType(item.type)) {
    return {
      kind: "ellipsis",
      type: item.type,
      page: item.page,
      content: "•••",
      ariaHidden: true,
      focusable: false,
    };
  }
  if (isDisabledControlType(item.type)) {
    return {
      kind: "disabled",
      type: item.type,
      page: item.page,
      content: isNextType(item.type) ? "›" : "‹",
      ariaLabel: isNextType(item.type)
        ? PAGE_NAV_NEXT_LABEL
        : PAGE_NAV_PREV_LABEL,
      ariaDisabled: true,
      focusable: false,
    };
  }
  if (isPrevType(item.type) || isNextType(item.type)) {
    return {
      kind: "link",
      type: item.type,
      page: item.page,
      content: isNextType(item.type) ? "›" : "‹",
      href: item.href,
      ariaLabel: isNextType(item.type)
        ? PAGE_NAV_NEXT_LABEL
        : PAGE_NAV_PREV_LABEL,
      focusable: true,
    };
  }
  return {
    kind: "link",
    type: item.type,
    page: item.page,
    content: String(item.page),
    href: item.href,
    ariaCurrent: item.type === "link-cur" ? "page" : undefined,
    focusable: true,
  };
}

export function describePageNav(items: PageItem[]): PageNavNode[] {
  return items.map(describePageNavNode);
}

export function focusablePageNavNodes(items: PageItem[]): PageNavNode[] {
  return describePageNav(items).filter((node) => node.focusable);
}

/**
 * When focus is inside PageNav, ArrowLeft / ArrowRight move among the
 * focusable controls (enabled prev/next and page-number links).
 * Disabled prev/next and ellipsis are skipped. No wrap at the ends.
 */
export function movePageNavFocusIndex(
  focusableCount: number,
  currentIndex: number,
  key: "ArrowLeft" | "ArrowRight"
): number {
  if (focusableCount <= 0) {
    return -1;
  }
  if (currentIndex < 0 || currentIndex >= focusableCount) {
    return currentIndex;
  }
  if (key === "ArrowLeft") {
    return currentIndex > 0 ? currentIndex - 1 : currentIndex;
  }
  return currentIndex < focusableCount - 1 ? currentIndex + 1 : currentIndex;
}

type FocusableEl = {
  focus: () => void;
  contains?: (node: unknown) => boolean;
};

/**
 * DOM handler used by the public PageNav. Exported so tests can drive the
 * same ArrowLeft / ArrowRight behavior without a browser.
 */
export function handlePageNavKeyDown(event: {
  key: string;
  currentTarget: { querySelectorAll: (selector: string) => ArrayLike<FocusableEl> };
  target?: EventTarget | null;
  preventDefault: () => void;
}): number | null {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return null;
  }
  const items = Array.from(
    event.currentTarget.querySelectorAll(`[${PAGE_NAV_ITEM_ATTR}]`)
  );
  if (items.length === 0) {
    return null;
  }
  const active = event.target;
  const current = items.findIndex(
    (el) =>
      el === active ||
      (typeof el.contains === "function" && el.contains(active))
  );
  if (current < 0) {
    return null;
  }
  const next = movePageNavFocusIndex(items.length, current, event.key);
  if (next === current || next < 0) {
    return current;
  }
  event.preventDefault();
  items[next].focus();
  return next;
}
