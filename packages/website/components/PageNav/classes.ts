/** Shared layout for every pagination cell (no background / text color). */
export const pageNavCommonCls =
  "inline-flex justify-center items-center transition-all";

/**
 * Non-current page numbers and prev/next. Light mode uses a white fill so the
 * current page must not reuse these utilities — Tailwind does not guarantee
 * that a later class in the string wins over `bg-white`.
 */
export const pageNavDefaultCls =
  "bg-white text-gray-600 hover:bg-gray-200 dark:bg-dark-1 dark:pg-text-dark dark:hover:bg-dark-hover dark:hover:pg-text-dark-hover";

/**
 * Current page: inverted fill + stronger text in light mode. Dark mode keeps
 * the existing hover-gray chip so night theme stays readable.
 */
export const pageNavCurrentCls =
  "bg-gray-700 text-white font-medium hover:bg-gray-800 dark:bg-dark-hover dark:pg-text-dark-hover dark:hover:bg-dark-hover dark:hover:pg-text-dark-hover";

export const pageNavEllipsisCls = `${pageNavCommonCls} text-gray-600 dark:pg-text-dark`;

export function pageNavNumberClass(isCurrent: boolean): string {
  return `${pageNavCommonCls} ${
    isCurrent ? pageNavCurrentCls : pageNavDefaultCls
  }`;
}

export function pageNavControlClass(): string {
  return `${pageNavCommonCls} ${pageNavDefaultCls}`;
}
