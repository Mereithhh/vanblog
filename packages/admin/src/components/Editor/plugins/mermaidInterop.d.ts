export const MERMAID_LOCALE_KEYS: string[];

export function resolveCallable<T = (...args: unknown[]) => unknown>(mod: unknown): T | undefined;

export function resolveMermaidApi<T extends { render: (...args: unknown[]) => unknown }>(
  mod: unknown,
  globalMermaid?: T,
): T | undefined;

export function svgFromRenderResult(result: unknown): string | undefined;

export function pickMermaidLocale(
  locale?: Record<string, unknown> | null,
): Record<string, string> | undefined;
