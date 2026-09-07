import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  SEARCH_CLEAR_LABEL,
  SEARCH_DIALOG_FOCUSABLE_SELECTOR,
  SEARCH_DIALOG_INPUT_SELECTOR,
  SEARCH_DIALOG_LABEL,
  SEARCH_INPUT_LABEL,
  SEARCH_RESULT_ATTR,
  SEARCH_RESULT_SELECTOR,
  SEARCH_RESULTS_LABEL,
  describeSearchClearControl,
  describeSearchDialog,
  describeSearchOpenFocusContract,
  focusSearchDialogInput,
  handleSearchDialogKeyDown,
  handleSearchShortcutKeyDown,
  moveSearchResultFocusIndex,
  nextSearchDialogTabIndex,
  openSearchFromUserGesture,
  revealSearchDialogForFocus,
  searchClearIsKeyboardActivatable,
  shouldTrapSearchDialogTab,
} from "../components/SearchCard/a11y";
import { dispatchKeyboardActivation } from "../utils/keyboardA11y";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

describe("search dialog a11y model", () => {
  it("names the dialog and clear control for a Chinese search panel", () => {
    expect(describeSearchDialog()).toEqual({
      role: "dialog",
      ariaModal: true,
      ariaLabel: "搜索",
    });
    expect(SEARCH_DIALOG_LABEL).toBe("搜索");
    expect(SEARCH_INPUT_LABEL).toBe("搜索内容");
    expect(SEARCH_CLEAR_LABEL).toBe("清除搜索");
    expect(SEARCH_RESULTS_LABEL).toBe("搜索结果");

    const clear = describeSearchClearControl();
    expect(clear).toMatchObject({
      tag: "button",
      type: "button",
      ariaLabel: "清除搜索",
      focusable: true,
    });
    expect(searchClearIsKeyboardActivatable("Enter")).toBe(true);
    expect(searchClearIsKeyboardActivatable(" ")).toBe(true);
    expect(searchClearIsKeyboardActivatable("Escape")).toBe(false);
  });
});

describe("search dialog open / escape / shortcut", () => {
  it("requires a same-turn tap focus so iOS Safari can raise the keyboard", () => {
    expect(describeSearchOpenFocusContract()).toEqual({
      focusInUserGesture: true,
      revealOverlayBeforeFocus: true,
      delayedFocusIsFallbackOnly: true,
      readOnlyFocusTrick: false,
      inputMode: "search",
    });
  });

  it("reveals the overlay then focuses the input in the same tap turn", () => {
    const order: string[] = [];
    const overlay = { style: { visibility: "hidden" } };
    const dialog = {
      style: { transform: "scale(0)" },
      setAttribute: (name: string, value: string) => {
        order.push(`attr:${name}=${value}`);
      },
    };
    const input = {
      focus: () => {
        expect(overlay.style.visibility).toBe("visible");
        expect(dialog.style.transform).toBe("scale(100%)");
        order.push("focus");
      },
    };
    let visible = false;

    const tapOpen = () => {
      order.push("tap");
      return openSearchFromUserGesture({
        overlay,
        dialog,
        input,
        setVisible: (v) => {
          visible = v;
          order.push("setVisible");
        },
        setBodyOverflow: (overflow) => {
          order.push(`overflow:${overflow}`);
        },
      });
    };

    expect(tapOpen()).toBe(true);
    expect(visible).toBe(true);
    expect(order).toEqual([
      "tap",
      "setVisible",
      "overflow:hidden",
      "attr:aria-hidden=false",
      "focus",
    ]);
  });

  it("still closes with Escape after a touch-oriented open that focused the field", () => {
    let visible = false;
    const focused: string[] = [];
    expect(
      openSearchFromUserGesture({
        overlay: { style: { visibility: "hidden" } },
        dialog: {
          style: { transform: "scale(0)" },
          setAttribute: () => undefined,
        },
        input: {
          focus: () => {
            focused.push("input");
          },
        },
        setVisible: (v) => {
          visible = v;
        },
      })
    ).toBe(true);
    expect(visible).toBe(true);
    expect(focused).toEqual(["input"]);

    expect(
      handleSearchShortcutKeyDown({
        key: "Escape",
        visible,
        preventDefault: () => undefined,
        onOpen: () => {
          visible = true;
        },
        onClose: () => {
          visible = false;
        },
      })
    ).toBe("close");
    expect(visible).toBe(false);
  });

  it("does not claim focus when the search input is missing", () => {
    revealSearchDialogForFocus({
      overlay: { style: { visibility: "hidden" } },
    });
    expect(
      openSearchFromUserGesture({
        overlay: { style: { visibility: "hidden" } },
        input: null,
        setVisible: () => undefined,
      })
    ).toBe(false);
  });

  it("moves focus into the dialog input when opened", () => {
    const focused: string[] = [];
    const input = {
      focus: () => {
        focused.push("input");
      },
    };
    const dialog = {
      querySelector: (selector: string) => {
        expect(selector).toBe(SEARCH_DIALOG_INPUT_SELECTOR);
        return input;
      },
    };
    expect(focusSearchDialogInput(dialog)).toBe(true);
    expect(focused).toEqual(["input"]);
    expect(
      focusSearchDialogInput({
        querySelector: () => null,
      })
    ).toBe(false);
  });

  it("closes on Escape only while the dialog is open", () => {
    const log: string[] = [];
    const fire = (key: string, visible: boolean) => {
      let prevented = false;
      return handleSearchShortcutKeyDown({
        key,
        visible,
        preventDefault: () => {
          prevented = true;
        },
        onOpen: () => {
          log.push("open");
        },
        onClose: () => {
          log.push("close");
        },
      });
    };

    expect(fire("Escape", true)).toBe("close");
    expect(fire("Escape", false)).toBe(null);
    expect(fire("Enter", true)).toBe(null);
    expect(log).toEqual(["close"]);
  });

  it("opens on Ctrl/Cmd+K and does not treat leftover Escape as a close when hidden", () => {
    const log: string[] = [];
    expect(
      handleSearchShortcutKeyDown({
        key: "k",
        ctrlKey: true,
        visible: false,
        preventDefault: () => undefined,
        onOpen: () => {
          log.push("open");
        },
        onClose: () => {
          log.push("close");
        },
      })
    ).toBe("open");
    expect(
      handleSearchShortcutKeyDown({
        key: "K",
        metaKey: true,
        visible: true,
        preventDefault: () => undefined,
        onOpen: () => {
          log.push("open-again");
        },
        onClose: () => {
          log.push("close");
        },
      })
    ).toBe("open");
    expect(log).toEqual(["open", "open-again"]);
  });
});

describe("search dialog Tab cycle", () => {
  it("wraps at both ends and pulls escaped focus back in", () => {
    expect(nextSearchDialogTabIndex(3, 2, false)).toBe(0);
    expect(nextSearchDialogTabIndex(3, 0, true)).toBe(2);
    expect(nextSearchDialogTabIndex(3, 1, false)).toBe(2);
    expect(nextSearchDialogTabIndex(3, 1, true)).toBe(0);
    expect(nextSearchDialogTabIndex(3, -1, false)).toBe(0);
    expect(nextSearchDialogTabIndex(3, -1, true)).toBe(2);
    expect(nextSearchDialogTabIndex(0, 0, false)).toBe(-1);

    expect(shouldTrapSearchDialogTab(3, 2, false)).toBe(true);
    expect(shouldTrapSearchDialogTab(3, 0, true)).toBe(true);
    expect(shouldTrapSearchDialogTab(3, -1, false)).toBe(true);
    expect(shouldTrapSearchDialogTab(3, 1, false)).toBe(false);
    expect(shouldTrapSearchDialogTab(3, 1, true)).toBe(false);
  });

  it("cycles Tab / Shift+Tab among input, clear, and results — not a page-behind node", () => {
    const focused: string[] = [];
    const make = (id: string) => ({
      id,
      focus: () => {
        focused.push(id);
      },
    });
    const input = make("input");
    const clear = make("clear");
    const r1 = make("r1");
    const r2 = make("r2");
    const pageBehind = make("page");
    const items = [input, clear, r1, r2];

    const currentTarget = {
      querySelectorAll: (selector: string) => {
        expect(selector).toBe(SEARCH_DIALOG_FOCUSABLE_SELECTOR);
        return items;
      },
      querySelector: () => input,
    };

    let active: unknown = r2;
    const fire = (key: string, shiftKey = false) => {
      let prevented = false;
      const action = handleSearchDialogKeyDown({
        key,
        shiftKey,
        visible: true,
        currentTarget,
        target: active,
        preventDefault: () => {
          prevented = true;
        },
      });
      return { action, prevented };
    };

    expect(fire("Tab")).toEqual({ action: "tab", prevented: true });
    expect(focused).toEqual(["input"]);
    active = input;

    expect(fire("Tab")).toEqual({ action: null, prevented: false });
    expect(fire("Tab", true)).toEqual({ action: "tab", prevented: true });
    expect(focused).toEqual(["input", "r2"]);

    active = pageBehind;
    expect(fire("Tab")).toEqual({ action: "tab", prevented: true });
    expect(focused).toEqual(["input", "r2", "input"]);
  });

  it("does not handle Tab when the dialog is closed", () => {
    expect(
      handleSearchDialogKeyDown({
        key: "Tab",
        visible: false,
        currentTarget: {
          querySelectorAll: () => [],
        },
        preventDefault: () => {
          throw new Error("should not trap when closed");
        },
      })
    ).toBe(null);
  });
});

describe("search result arrows and Enter", () => {
  it("moves one result at a time and returns to the input from the first", () => {
    expect(moveSearchResultFocusIndex(3, -1, "ArrowDown")).toBe(0);
    expect(moveSearchResultFocusIndex(3, 0, "ArrowDown")).toBe(1);
    expect(moveSearchResultFocusIndex(3, 2, "ArrowDown")).toBe(2);
    expect(moveSearchResultFocusIndex(3, 2, "ArrowUp")).toBe(1);
    expect(moveSearchResultFocusIndex(3, 0, "ArrowUp")).toBe(-1);
    expect(moveSearchResultFocusIndex(3, -1, "ArrowUp")).toBe(-1);
    expect(moveSearchResultFocusIndex(0, -1, "ArrowDown")).toBe(-1);
  });

  it("ArrowDown / ArrowUp move among ArticleList result links via the shared handler", () => {
    const focused: string[] = [];
    const input = {
      id: "input",
      focus: () => {
        focused.push("input");
      },
    };
    const results = ["r0", "r1"].map((id) => ({
      id,
      focus: () => {
        focused.push(id);
      },
    }));

    const currentTarget = {
      querySelectorAll: (selector: string) => {
        if (selector === SEARCH_RESULT_SELECTOR) return results;
        return [input, ...results];
      },
      querySelector: (selector: string) => {
        expect(selector).toBe(SEARCH_DIALOG_INPUT_SELECTOR);
        return input;
      },
    };

    let active: unknown = input;
    const fire = (key: string) =>
      handleSearchDialogKeyDown({
        key,
        visible: true,
        currentTarget,
        target: active,
        preventDefault: () => undefined,
      });

    expect(fire("ArrowDown")).toBe("result");
    expect(focused).toEqual(["r0"]);
    active = results[0];
    expect(fire("ArrowDown")).toBe("result");
    active = results[1];
    expect(fire("ArrowDown")).toBe("result");
    expect(fire("ArrowUp")).toBe("result");
    active = results[0];
    expect(fire("ArrowUp")).toBe("input");
    expect(focused).toEqual(["r0", "r1", "r0", "input"]);
    expect(fire("Enter")).toBe(null);
  });

  it("activates a result link with Enter (same path as a native <a>)", () => {
    const opened: string[] = [];
    const activate = () => {
      opened.push("/post/1");
    };
    expect(dispatchKeyboardActivation("a", "Enter", activate)).toBe(true);
    expect(dispatchKeyboardActivation("a", " ", activate)).toBe(false);
    expect(dispatchKeyboardActivation("div", "Enter", activate)).toBe(false);
    expect(opened).toEqual(["/post/1"]);
  });

  it("activates the clear button with Enter and Space", () => {
    const cleared: string[] = [];
    const clear = () => {
      cleared.push("cleared");
    };
    expect(dispatchKeyboardActivation("button", "Enter", clear)).toBe(true);
    expect(dispatchKeyboardActivation("button", " ", clear)).toBe(true);
    expect(dispatchKeyboardActivation("div", "Enter", clear)).toBe(false);
    expect(cleared).toEqual(["cleared", "cleared"]);
  });
});

describe("search dialog markup", () => {
  const card = readSrc("components/SearchCard/index.tsx");
  const nav = readSrc("components/NavBar/index.tsx");
  const list = readSrc("components/ArticleList/index.tsx");

  it("uses dialog semantics and focuses the input on open", () => {
    expect(card).toMatch(/role=\{describeSearchDialog\(\)\.role\}/);
    expect(card).toMatch(/aria-modal=\{props\.visible\}/);
    expect(card).toMatch(/aria-label=\{SEARCH_DIALOG_LABEL\}/);
    expect(card).toMatch(/focusSearchDialogInput/);
    expect(card).toMatch(/handleSearchDialogKeyDown/);
    expect(card).toMatch(/handleSearchShortcutKeyDown/);
    expect(card).toMatch(/aria-label=\{SEARCH_INPUT_LABEL\}/);
  });

  it("opens from the header tap via the same-turn focus helper (iOS Safari)", () => {
    expect(card).toMatch(/openSearchFromUserGesture/);
    expect(card).toMatch(/openFromUserGesture/);
    expect(card).toMatch(/useImperativeHandle/);
    expect(card).toMatch(/inputMode="search"/);
    expect(card).not.toMatch(/readOnly|readonly/);
    expect(nav).toMatch(/searchCardRef\.current\?\.openFromUserGesture\(\)/);
    expect(nav).not.toMatch(
      /setShowSearch\(true\);\s+document\.body\.style\.overflow/
    );
  });

  it("makes the clear control a native button, not a click-only div", () => {
    expect(card).toMatch(/<button[\s\S]*type="button"[\s\S]*SEARCH_CLEAR_LABEL/);
    expect(card).toMatch(/aria-label=\{SEARCH_CLEAR_LABEL\}/);
    expect(card).not.toMatch(
      /<div\s+className="transition-all transform hover:scale-125 text-gray-600 dark:text-dark"/
    );
  });

  it("keeps ArticleList result links and marks them for arrow navigation", () => {
    expect(card).toMatch(/<ArticleList/);
    expect(card).toMatch(/itemAttr=\{SEARCH_RESULT_ATTR\}/);
    expect(list).toMatch(/props\.itemAttr/);
    expect(SEARCH_RESULT_ATTR).toBe("data-search-result");
  });
});
