export const MORE_COMMENT: RegExp;

export function isMoreCommentNode(node: unknown): boolean;

export function moreMarkerElement(): {
  type: 'element';
  tagName: 'div';
  properties: Record<string, unknown>;
  children: unknown[];
};

export function replaceMoreComments<T>(tree: T): T;

export function moreMarkerRehype(): (tree: unknown) => unknown;
