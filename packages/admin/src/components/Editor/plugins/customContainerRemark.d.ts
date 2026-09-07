export const CUSTOM_CONTAINER_TITLE: Record<string, string>;

export function applyCustomContainers<T>(tree: T): T;

export function hasContainerTitle(children: unknown[]): boolean;

export function useDirectivePlugin<T>(processor: T, remarkDirectiveMod: unknown): T;
