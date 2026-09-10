import {
  PageNavProps,
  pageCount,
  pageHref,
  shouldShowPageNav,
} from "./core";

/** Landmark / form name for the jump-to-page control. */
export const PAGE_NAV_JUMP_LABEL = "跳转到页码";
export const PAGE_NAV_JUMP_PREFIX = "跳转";
export const PAGE_NAV_JUMP_UNIT = "页";
export const PAGE_NAV_JUMP_INPUT_LABEL = "页码";
export const PAGE_NAV_JUMP_GO_LABEL = "前往";
export const PAGE_NAV_JUMP_INPUT_ID = "page-nav-jump";
export const PAGE_NAV_JUMP_INPUT_ATTR = "data-page-nav-jump-input";

export type PageNavJumpOk = {
  ok: true;
  page: number;
  href: string;
};

export type PageNavJumpFail = {
  ok: false;
  reason: "empty" | "invalid" | "outofrange" | "unavailable";
};

export type PageNavJumpResult = PageNavJumpOk | PageNavJumpFail;

export type PageNavJumpProps = Pick<
  PageNavProps,
  "total" | "pageSize" | "base" | "more"
>;

/**
 * Parse a typed page number. Empty / non-integer strings return null so the
 * caller can refuse to navigate (no crash, no blank `/page/NaN`).
 */
export function parseJumpPage(raw: string): number | null {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") {
    return null;
  }
  if (!/^-?\d+$/.test(trimmed)) {
    return null;
  }
  const page = Number(trimmed);
  if (!Number.isFinite(page)) {
    return null;
  }
  return page;
}

export function shouldShowPageNavJump(
  total: number,
  pageSize?: number
): boolean {
  return shouldShowPageNav(total, pageSize);
}

export function describePageNavJump(props: PageNavJumpProps) {
  const totalPages = pageCount(props.total, props.pageSize);
  const visible = shouldShowPageNavJump(props.total, props.pageSize);
  return {
    visible,
    totalPages,
    label: PAGE_NAV_JUMP_LABEL,
    prefix: PAGE_NAV_JUMP_PREFIX,
    unit: PAGE_NAV_JUMP_UNIT,
    input: {
      tag: "input" as const,
      type: "number" as const,
      id: PAGE_NAV_JUMP_INPUT_ID,
      min: 1,
      max: Math.max(totalPages, 1),
      step: 1,
      focusable: true,
      ariaLabel: PAGE_NAV_JUMP_INPUT_LABEL,
      attr: PAGE_NAV_JUMP_INPUT_ATTR,
    },
    submit: {
      tag: "button" as const,
      type: "submit" as const,
      focusable: true,
      ariaLabel: PAGE_NAV_JUMP_GO_LABEL,
    },
  };
}

export function resolvePageNavJump(
  raw: string,
  props: PageNavJumpProps
): PageNavJumpResult {
  const totalPages = pageCount(props.total, props.pageSize);
  if (totalPages <= 1) {
    return { ok: false, reason: "unavailable" };
  }
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") {
    return { ok: false, reason: "empty" };
  }
  const parsed = parseJumpPage(raw);
  if (parsed === null) {
    return { ok: false, reason: "invalid" };
  }
  if (parsed < 1 || parsed > totalPages) {
    return { ok: false, reason: "outofrange" };
  }
  return {
    ok: true,
    page: parsed,
    href: pageHref(props.base, props.more, parsed),
  };
}

export function submitPageNavJump(
  raw: string,
  props: PageNavJumpProps,
  navigate: (href: string) => void
): PageNavJumpResult {
  const result = resolvePageNavJump(raw, props);
  if (result.ok) {
    navigate(result.href);
  }
  return result;
}

/** Form submit (mouse click on 前往, or native Enter in the input). */
export function handlePageNavJumpSubmit(
  event: { preventDefault: () => void },
  raw: string,
  props: PageNavJumpProps,
  navigate: (href: string) => void
): PageNavJumpResult {
  event.preventDefault();
  return submitPageNavJump(raw, props, navigate);
}

/**
 * Enter in the number field uses the same path as the form. Other keys
 * (including ArrowLeft / ArrowRight) are left alone so #542 page-link
 * arrows and the native spinner keep working.
 */
export function handlePageNavJumpKeyDown(
  event: { key: string; preventDefault: () => void },
  raw: string,
  props: PageNavJumpProps,
  navigate: (href: string) => void
): PageNavJumpResult | null {
  if (event.key !== "Enter") {
    return null;
  }
  event.preventDefault();
  return submitPageNavJump(raw, props, navigate);
}
