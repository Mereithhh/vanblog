/** Shared heading-anchor text so TOC links and heading `id`/`data-id` stay in sync. */
export function normalizeHeadingText(text: string | null | undefined): string {
  return String(text ?? "").trim();
}

/** Flatten heading AST children so inline markdown/HTML still yields the visible title. */
export function collectHeadingText(node: {
  type?: string;
  value?: string;
  children?: unknown[];
} | null | undefined): string {
  if (!node) return "";
  if (typeof node.value === "string" && !Array.isArray(node.children)) {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map((child) => collectHeadingText(child as typeof node)).join("");
  }
  return "";
}
