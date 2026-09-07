import { activatesWithKey, isFocusableActionControl } from "../../utils/keyboardA11y";

export const CODE_COPY_LABEL = "复制代码";
export const CODE_COPY_CLASS = "code-copy-btn";

export const CODE_COPY_CONTROL = {
  tag: "button" as const,
  type: "button" as const,
  className: CODE_COPY_CLASS,
  ariaLabel: CODE_COPY_LABEL,
  activateKeys: ["Enter", " "] as const,
  focusable: true,
};

export function describeCodeCopyControl() {
  return CODE_COPY_CONTROL;
}

export function codeCopyIsKeyboardActivatable(key: string): boolean {
  return (
    isFocusableActionControl({
      tagName: CODE_COPY_CONTROL.tag,
      type: CODE_COPY_CONTROL.type,
    }) && activatesWithKey(CODE_COPY_CONTROL.tag, key)
  );
}

export function readCodeFromCopyButton(copyBtn: {
  parentElement?: {
    parentElement?: {
      querySelector?: (selector: string) => { innerText?: string } | null;
    } | null;
  } | null;
}): string {
  return (
    copyBtn.parentElement?.parentElement?.querySelector?.("code")?.innerText ??
    ""
  );
}
