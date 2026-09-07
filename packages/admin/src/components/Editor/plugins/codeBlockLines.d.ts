export const CODE_LINE_CLASS: string;
export const CODE_LINE_NUMBER_CLASS: string;
export const CODE_LINE_CONTENT_CLASS: string;
export const CODE_BLOCK_LINE_NUMBERS_CLASS: string;

export function findFencedCodeNode(children: unknown): { tagName?: string; properties?: Record<string, unknown> } | undefined;
export function applyLineNumbersToCodeNode(codeNode: unknown): void;
export function wrapCodeChildrenWithLineNumbers(children: unknown[]): unknown[];
export function readFencedCodeText(
  code:
    | {
        querySelectorAll?: (selector: string) => ArrayLike<{ textContent?: string; innerText?: string }>;
        innerText?: string;
        textContent?: string;
      }
    | null
    | undefined,
): string;
