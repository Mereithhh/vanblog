import {
  activatesWithKey,
  isFocusableActionControl,
} from "../../utils/keyboardA11y";

/** Accessible name for the public search `<div role="dialog">`. */
export const SEARCH_DIALOG_LABEL = "搜索";
export const SEARCH_INPUT_LABEL = "搜索内容";
export const SEARCH_CLEAR_LABEL = "清除搜索";
export const SEARCH_RESULTS_LABEL = "搜索结果";

/** Class on the dialog `<input type="search">` so native WebKit clear is hidden. */
export const SEARCH_INPUT_CLASS = "search-dialog-input";

/**
 * Clear control hover: opacity/color only.
 * `hover:scale-125` was the jarring animation in #173.
 * Includes the same transparent-button reset as other header icon actions.
 */
export const SEARCH_CLEAR_BUTTON_CLASS =
  "bg-transparent border-0 p-0 appearance-none flex items-center justify-center cursor-pointer text-gray-600 dark:text-dark opacity-70 hover:opacity-100 hover:text-gray-900 dark:hover:text-dark-hover transition-opacity transition-colors";

/**
 * Extra stroke on the filled magnifier so it reads closer to neighboring
 * header icons (hamburger / theme) instead of a hairline ring (#173).
 */
export const SEARCH_ICON_STROKE_WIDTH = 64;

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

/** Native search field + Safari attrs from #173 (no autocomplete suggestions). */
export function describeSearchInputAttrs() {
  return {
    type: "search" as const,
    inputMode: "search" as const,
    enterKeyHint: "search" as const,
    autoComplete: "off" as const,
    spellCheck: false as const,
    autoCapitalize: "off" as const,
    autoCorrect: "off" as const,
  };
}

/**
 * iOS Safari only raises the software keyboard if `focus()` runs in the
 * same user-gesture turn as the tap. `useEffect` / `transitionend` are
 * too late. The overlay is already mounted (`visibility: hidden` +
 * `scale(0)`), so reveal it synchronously and then focus — do not wait
 * for React to commit, and do not use a `readOnly` input trick.
 */
export function describeSearchOpenFocusContract() {
  return {
    focusInUserGesture: true,
    revealOverlayBeforeFocus: true,
    delayedFocusIsFallbackOnly: true,
    readOnlyFocusTrick: false,
    type: "search" as const,
    inputMode: "search" as const,
  };
}

type SearchOverlayEl = {
  style: { visibility: string };
};

type SearchDialogEl = {
  style?: { transform?: string };
  setAttribute?: (name: string, value: string) => void;
};

export function revealSearchDialogForFocus(parts: {
  overlay?: SearchOverlayEl | null;
  dialog?: SearchDialogEl | null;
}): void {
  if (parts.overlay) {
    parts.overlay.style.visibility = "visible";
  }
  if (parts.dialog?.style) {
    parts.dialog.style.transform = "scale(100%)";
  }
  parts.dialog?.setAttribute?.("aria-hidden", "false");
}

export function openSearchFromUserGesture(options: {
  overlay?: SearchOverlayEl | null;
  dialog?: SearchDialogEl | null;
  input?: FocusableEl | null;
  setVisible: (visible: boolean) => void;
  setBodyOverflow?: (overflow: string) => void;
}): boolean {
  options.setVisible(true);
  options.setBodyOverflow?.("hidden");
  revealSearchDialogForFocus({
    overlay: options.overlay,
    dialog: options.dialog,
  });
  if (!options.input) return false;
  options.input.focus?.();
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
