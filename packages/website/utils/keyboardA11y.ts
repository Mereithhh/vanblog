/**
 * Shared keyboard contract for public-site icon actions.
 * Native <button> activates on Enter and Space; links activate on Enter.
 */

export function activatesWithKey(
  tagName: string,
  key: string
): boolean {
  const tag = tagName.toLowerCase();
  if (key === "Enter") {
    return tag === "button" || tag === "a";
  }
  if (key === " " || key === "Spacebar") {
    return tag === "button";
  }
  return false;
}

export function isFocusableActionControl(el: {
  tagName: string;
  type?: string | null;
  role?: string | null;
  disabled?: boolean;
  tabIndex?: number | null;
  ariaHidden?: boolean;
  href?: string | null;
}): boolean {
  if (el.ariaHidden || el.disabled) return false;
  if ((el.tabIndex ?? 0) < 0) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "button") {
    return el.type === "button" || el.type == null || el.type === "";
  }
  if (tag === "a") {
    return Boolean(el.href);
  }
  if (el.role === "button") {
    return (el.tabIndex ?? -1) >= 0;
  }
  return false;
}

/** Browser contract: a focused native button fires click on Enter/Space. */
export function dispatchKeyboardActivation(
  tagName: string,
  key: string,
  activate: () => void
): boolean {
  if (!activatesWithKey(tagName, key)) return false;
  activate();
  return true;
}
