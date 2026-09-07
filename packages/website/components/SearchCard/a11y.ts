import {
  activatesWithKey,
  isFocusableActionControl,
} from "../../utils/keyboardA11y";

/** Accessible name for the public search `<div role="dialog">`. */
export const SEARCH_DIALOG_LABEL = "搜索";
export const SEARCH_INPUT_LABEL = "搜索内容";
export const SEARCH_CLEAR_LABEL = "清除搜索";
export const SEARCH_RESULTS_LABEL = "搜索结果";

/** Marks the search field so open/arrow-up can restore focus. */
export const SEARCH_DIALOG_INPUT_ATTR = "data-search-input";
export const SEARCH_DIALOG_INPUT_SELECTOR = `[${SEARCH_DIALOG_INPUT_ATTR}]`;

/** Marks ArticleList result links for ArrowUp / ArrowDown. */
export const SEARCH_RESULT_ATTR = "data-search-result";
export const SEARCH_RESULT_SELECTOR = `[${SEARCH_RESULT_ATTR}]`;

/**
 * Sequential-focus targets inside the open dialog.
 * Hidden clear (`tabindex="-1"`) is excluded.
 */
export const SEARCH_DIALOG_FOCUSABLE_SELECTOR = [
  `input${SEARCH_DIALOG_INPUT_SELECTOR}:not([disabled])`,
  `button:not([disabled]):not([tabindex="-1"])`,
  `a[href]:not([tabindex="-1"])`,
].join(",");

export type SearchDialogModel = {
  role: "dialog";
  ariaModal: true;
  ariaLabel: string;
};

export type SearchClearControl = {
  tag: "button";
  type: "button";
  ariaLabel: string;
  activateKeys: readonly string[];
  focusable: true;
};

const BUTTON_KEYS = ["Enter", " "] as const;

export function describeSearchDialog(): SearchDialogModel {
  return {
    role: "dialog",
    ariaModal: true,
    ariaLabel: SEARCH_DIALOG_LABEL,
  };
}

export function describeSearchClearControl(): SearchClearControl {
  return {
    tag: "button",
    type: "button",
    ariaLabel: SEARCH_CLEAR_LABEL,
    activateKeys: BUTTON_KEYS,
    focusable: true,
  };
}

export function searchClearIsKeyboardActivatable(key: string): boolean {
  const control = describeSearchClearControl();
  return (
    control.focusable &&
    isFocusableActionControl({
      tagName: control.tag,
      type: control.type,
    }) &&
    activatesWithKey(control.tag, key)
  );
}

type FocusableEl = {
  focus?: () => void;
  contains?: (node: unknown) => boolean;
};

export function indexOfSearchFocusable(
  items: FocusableEl[],
  active: unknown
): number {
  return items.findIndex(
    (el) =>
      el === active ||
      (typeof el.contains === "function" && el.contains(active))
  );
}

/**
 * Tab / Shift+Tab wrap. `currentIndex === -1` means focus left the dialog.
 */
export function nextSearchDialogTabIndex(
  count: number,
  currentIndex: number,
  shiftKey: boolean
): number {
  if (count <= 0) return -1;
  if (currentIndex < 0) {
    return shiftKey ? count - 1 : 0;
  }
  if (shiftKey) {
    return currentIndex <= 0 ? count - 1 : currentIndex - 1;
  }
  return currentIndex >= count - 1 ? 0 : currentIndex + 1;
}

/** Only intercept Tab when wrapping or when focus has escaped the dialog. */
export function shouldTrapSearchDialogTab(
  count: number,
  currentIndex: number,
  shiftKey: boolean
): boolean {
  if (count <= 0) return true;
  if (currentIndex < 0) return true;
  if (!shiftKey && currentIndex === count - 1) return true;
  if (shiftKey && currentIndex === 0) return true;
  return false;
}

/**
 * ArrowDown / ArrowUp among result links.
 * `-1` is the search input (not a result). Ends do not wrap;
 * ArrowUp on the first result returns to the input.
 */
export function moveSearchResultFocusIndex(
  resultCount: number,
  currentIndex: number,
  key: "ArrowDown" | "ArrowUp"
): number {
  if (resultCount <= 0) return -1;
  if (key === "ArrowDown") {
    if (currentIndex < 0) return 0;
    return currentIndex < resultCount - 1 ? currentIndex + 1 : currentIndex;
  }
  if (currentIndex <= 0) return -1;
  return currentIndex - 1;
}

export function focusSearchDialogInput(dialog: {
  querySelector: (selector: string) => FocusableEl | null;
}): boolean {
  const input = dialog.querySelector(SEARCH_DIALOG_INPUT_SELECTOR);
  if (!input) return false;
  input.focus?.();
  return true;
}

export function handleSearchShortcutKeyDown(event: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  visible: boolean;
  preventDefault: () => void;
  onOpen: () => void;
  onClose: () => void;
}): "open" | "close" | null {
  if (event.key === "Escape") {
    if (!event.visible) return null;
    event.preventDefault();
    event.onClose();
    return "close";
  }
  if (
    (event.ctrlKey === true || event.metaKey === true) &&
    event.key.toLocaleLowerCase() === "k"
  ) {
    event.preventDefault();
    event.onOpen();
    return "open";
  }
  return null;
}

/**
 * In-dialog keys: Tab trap and ArrowUp / ArrowDown on ArticleList links.
 * Escape / Ctrl+K stay on the window shortcut handler.
 */
export function handleSearchDialogKeyDown(event: {
  key: string;
  shiftKey?: boolean;
  visible?: boolean;
  currentTarget: {
    querySelectorAll: (selector: string) => ArrayLike<FocusableEl>;
    querySelector?: (selector: string) => FocusableEl | null;
  };
  target?: EventTarget | null;
  preventDefault: () => void;
}): "tab" | "result" | "input" | null {
  if (event.visible === false) return null;

  if (event.key === "Tab") {
    const items = Array.from(
      event.currentTarget.querySelectorAll(SEARCH_DIALOG_FOCUSABLE_SELECTOR)
    );
    const current = indexOfSearchFocusable(items, event.target);
    if (!shouldTrapSearchDialogTab(items.length, current, !!event.shiftKey)) {
      return null;
    }
    event.preventDefault();
    const next = nextSearchDialogTabIndex(
      items.length,
      current,
      !!event.shiftKey
    );
    if (next >= 0) items[next].focus?.();
    return "tab";
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const results = Array.from(
      event.currentTarget.querySelectorAll(SEARCH_RESULT_SELECTOR)
    );
    if (results.length === 0) return null;
    const current = indexOfSearchFocusable(results, event.target);
    const next = moveSearchResultFocusIndex(results.length, current, event.key);
    if (next === current) {
      return current < 0 ? "input" : "result";
    }
    event.preventDefault();
    if (next < 0) {
      focusSearchDialogInput({
        querySelector:
          event.currentTarget.querySelector?.bind(event.currentTarget) ??
          (() => null),
      });
      return "input";
    }
    results[next].focus?.();
    return "result";
  }

  return null;
}

export { activatesWithKey, isFocusableActionControl };
