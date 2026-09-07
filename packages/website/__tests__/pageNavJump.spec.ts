import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  PAGE_NAV_ITEM_ATTR,
  describePageNav,
  focusablePageNavNodes,
  handlePageNavKeyDown,
} from "../components/PageNav/a11y";
import {
  calItemList,
  pageCount,
  pageHref,
  PageNavProps,
  shouldShowPageNav,
} from "../components/PageNav/core";
import {
  PAGE_NAV_JUMP_GO_LABEL,
  PAGE_NAV_JUMP_INPUT_ATTR,
  PAGE_NAV_JUMP_INPUT_ID,
  PAGE_NAV_JUMP_INPUT_LABEL,
  PAGE_NAV_JUMP_LABEL,
  PAGE_NAV_JUMP_PREFIX,
  PAGE_NAV_JUMP_UNIT,
  clampJumpPage,
  describePageNavJump,
  handlePageNavJumpKeyDown,
  handlePageNavJumpSubmit,
  parseJumpPage,
  resolvePageNavJump,
  shouldShowPageNavJump,
  submitPageNavJump,
} from "../components/PageNav/jump";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const jumpOf = (
  overrides: Partial<PageNavProps> & Pick<PageNavProps, "total" | "current">
): PageNavProps => ({
  base: "/",
  more: "/page",
  ...overrides,
});

const itemsOf = (
  overrides: Partial<PageNavProps> & Pick<PageNavProps, "total" | "current">
) => calItemList(jumpOf(overrides));

describe("pageHref / pageCount used by jump and page links", () => {
  it("uses / for page 1 and /page/N for later pages", () => {
    expect(pageHref("/", "/page", 1)).toBe("/");
    expect(pageHref("/", "/page", 2)).toBe("/page/2");
    expect(pageHref("/", "/page", 10)).toBe("/page/10");
    expect(pageCount(15)).toBe(3);
    expect(pageCount(50)).toBe(10);
    expect(pageCount(5)).toBe(1);
    expect(shouldShowPageNav(15)).toBe(true);
    expect(shouldShowPageNav(5)).toBe(false);
  });
});

describe("PageNav jump control model", () => {
  it("is present only when there is more than one page", () => {
    const multi = describePageNavJump(jumpOf({ total: 15, current: 1 }));
    expect(shouldShowPageNavJump(15)).toBe(true);
    expect(multi.visible).toBe(true);
    expect(multi.totalPages).toBe(3);
    expect(multi.input).toMatchObject({
      tag: "input",
      type: "number",
      id: PAGE_NAV_JUMP_INPUT_ID,
      min: 1,
      max: 3,
      focusable: true,
      ariaLabel: PAGE_NAV_JUMP_INPUT_LABEL,
      attr: PAGE_NAV_JUMP_INPUT_ATTR,
    });
    expect(multi.submit).toMatchObject({
      tag: "button",
      type: "submit",
      focusable: true,
      ariaLabel: PAGE_NAV_JUMP_GO_LABEL,
    });
    expect(multi.label).toBe(PAGE_NAV_JUMP_LABEL);
    expect(multi.prefix).toBe("跳转");
    expect(multi.unit).toBe("页");

    const single = describePageNavJump(jumpOf({ total: 5, current: 1 }));
    expect(shouldShowPageNavJump(5)).toBe(false);
    expect(single.visible).toBe(false);
    expect(single.totalPages).toBe(1);
  });

  it("uses Chinese jump / go labels", () => {
    expect(PAGE_NAV_JUMP_LABEL).toBe("跳转到页码");
    expect(PAGE_NAV_JUMP_PREFIX).toBe("跳转");
    expect(PAGE_NAV_JUMP_UNIT).toBe("页");
    expect(PAGE_NAV_JUMP_INPUT_LABEL).toBe("页码");
    expect(PAGE_NAV_JUMP_GO_LABEL).toBe("前往");
  });
});

describe("resolvePageNavJump navigation path", () => {
  const props = jumpOf({ total: 50, current: 2 });

  it("navigates to a valid page using the same href as page links", () => {
    expect(resolvePageNavJump("3", props)).toEqual({
      ok: true,
      page: 3,
      href: "/page/3",
      clamped: false,
    });
    expect(resolvePageNavJump("1", props)).toEqual({
      ok: true,
      page: 1,
      href: "/",
      clamped: false,
    });
    expect(resolvePageNavJump("10", props)).toEqual({
      ok: true,
      page: 10,
      href: "/page/10",
      clamped: false,
    });
    expect(pageHref(props.base, props.more, 3)).toBe("/page/3");
  });

  it("rejects empty and non-integer input without navigating", () => {
    expect(parseJumpPage("")).toBeNull();
    expect(parseJumpPage("   ")).toBeNull();
    expect(parseJumpPage("abc")).toBeNull();
    expect(parseJumpPage("1.5")).toBeNull();
    expect(parseJumpPage("1e2")).toBeNull();
    expect(resolvePageNavJump("", props)).toEqual({
      ok: false,
      reason: "empty",
    });
    expect(resolvePageNavJump("   ", props)).toEqual({
      ok: false,
      reason: "empty",
    });
    expect(resolvePageNavJump("abc", props)).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(resolvePageNavJump("2.9", props)).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("clamps out-of-range values to 1..totalPages", () => {
    expect(clampJumpPage(0, 10)).toBe(1);
    expect(clampJumpPage(-4, 10)).toBe(1);
    expect(clampJumpPage(99, 10)).toBe(10);
    expect(resolvePageNavJump("0", props)).toEqual({
      ok: true,
      page: 1,
      href: "/",
      clamped: true,
    });
    expect(resolvePageNavJump("-3", props)).toEqual({
      ok: true,
      page: 1,
      href: "/",
      clamped: true,
    });
    expect(resolvePageNavJump("999", props)).toEqual({
      ok: true,
      page: 10,
      href: "/page/10",
      clamped: true,
    });
  });

  it("does not offer jump on a single-page list", () => {
    expect(
      resolvePageNavJump("1", jumpOf({ total: 5, current: 1 }))
    ).toEqual({ ok: false, reason: "unavailable" });
  });

  it("submit invokes navigate only for a resolved href", () => {
    const navigated: string[] = [];
    const go = (href: string) => {
      navigated.push(href);
    };
    expect(submitPageNavJump("4", props, go)).toMatchObject({
      ok: true,
      href: "/page/4",
    });
    expect(submitPageNavJump("", props, go)).toMatchObject({
      ok: false,
      reason: "empty",
    });
    expect(submitPageNavJump("nope", props, go)).toMatchObject({
      ok: false,
      reason: "invalid",
    });
    expect(navigated).toEqual(["/page/4"]);
  });
});

describe("PageNav jump keyboard Enter", () => {
  const props = jumpOf({ total: 15, current: 1 });

  it("Enter submits the same path as the form; other keys do not", () => {
    const navigated: string[] = [];
    const go = (href: string) => {
      navigated.push(href);
    };

    let prevented = false;
    expect(
      handlePageNavJumpKeyDown(
        {
          key: "Enter",
          preventDefault: () => {
            prevented = true;
          },
        },
        "2",
        props,
        go
      )
    ).toEqual({
      ok: true,
      page: 2,
      href: "/page/2",
      clamped: false,
    });
    expect(prevented).toBe(true);

    expect(
      handlePageNavJumpKeyDown(
        {
          key: "ArrowLeft",
          preventDefault: () => {
            throw new Error("arrow keys must not submit jump");
          },
        },
        "2",
        props,
        go
      )
    ).toBeNull();
    expect(
      handlePageNavJumpKeyDown(
        {
          key: " ",
          preventDefault: () => {
            throw new Error("space must not submit jump from the input");
          },
        },
        "2",
        props,
        go
      )
    ).toBeNull();

    prevented = false;
    expect(
      handlePageNavJumpSubmit(
        {
          preventDefault: () => {
            prevented = true;
          },
        },
        "3",
        props,
        go
      )
    ).toMatchObject({ ok: true, href: "/page/3" });
    expect(prevented).toBe(true);
    expect(navigated).toEqual(["/page/2", "/page/3"]);
  });

  it("Enter on empty / invalid input does not navigate", () => {
    const navigated: string[] = [];
    const fire = (raw: string) =>
      handlePageNavJumpKeyDown(
        { key: "Enter", preventDefault: () => undefined },
        raw,
        props,
        (href) => {
          navigated.push(href);
        }
      );
    expect(fire("")).toEqual({ ok: false, reason: "empty" });
    expect(fire("xyz")).toEqual({ ok: false, reason: "invalid" });
    expect(navigated).toEqual([]);
  });
});

describe("PageNav jump does not break #542 a11y", () => {
  it("keeps ellipsis / disabled prev-next out of the focusable set", () => {
    const nodes = describePageNav(itemsOf({ total: 50, current: 6 }));
    expect(nodes.filter((node) => node.kind === "ellipsis")).toHaveLength(2);
    expect(
      nodes.some((node) => node.kind === "ellipsis" && node.href)
    ).toBe(false);
    expect(
      focusablePageNavNodes(itemsOf({ total: 50, current: 1 })).every(
        (node) => node.kind === "link" && node.href
      )
    ).toBe(true);
  });

  it("does not treat the jump input as an arrow-key page-nav target", () => {
    const items = [0, 1].map((i) => ({
      id: i,
      focus: () => {
        throw new Error("jump input must not move page-link focus");
      },
    }));
    const jumpInput = { id: "jump" };
    expect(
      handlePageNavKeyDown({
        key: "ArrowRight",
        currentTarget: {
          querySelectorAll: (selector: string) => {
            expect(selector).toBe(`[${PAGE_NAV_ITEM_ATTR}]`);
            return items;
          },
        },
        target: jumpInput,
        preventDefault: () => {
          throw new Error("should not steal arrows from the jump input");
        },
      })
    ).toBeNull();
    expect(PAGE_NAV_JUMP_INPUT_ATTR).not.toBe(PAGE_NAV_ITEM_ATTR);
  });
});

describe("PageNav jump markup", () => {
  const render = readSrc("components/PageNav/render.tsx");
  const index = readSrc("components/PageNav/index.tsx");

  it("renders a focusable number input and submit button when jump is shown", () => {
    expect(render).toMatch(/<form[\s\S]*aria-label=\{PAGE_NAV_JUMP_LABEL\}/);
    expect(render).toMatch(/handlePageNavJumpSubmit/);
    expect(render).toMatch(/handlePageNavJumpKeyDown/);
    expect(render).toMatch(/type="number"/);
    expect(render).toMatch(/aria-label=\{PAGE_NAV_JUMP_INPUT_LABEL\}/);
    expect(render).toMatch(/PAGE_NAV_JUMP_INPUT_ATTR/);
    expect(render).toMatch(/<button type="submit"/);
    expect(render).toMatch(/PAGE_NAV_JUMP_GO_LABEL/);
    expect(render).toMatch(/router\.push/);
    expect(render).toMatch(/shouldShowPageNavJump/);
    expect(render).not.toMatch(
      new RegExp(`${PAGE_NAV_ITEM_ATTR}.*${PAGE_NAV_JUMP_INPUT_ID}`)
    );
  });

  it("wires jump through PageNav only on multi-page lists", () => {
    expect(index).toMatch(/shouldShowPageNav/);
    expect(index).toMatch(/jump=\{props\}/);
    expect(index).toMatch(/calItemList\(props\)/);
  });
});
