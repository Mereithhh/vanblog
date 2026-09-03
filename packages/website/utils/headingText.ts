/** Shared heading-anchor text so TOC links and heading `id`/`data-id` stay in sync. */
export function normalizeHeadingText(text: string | null | undefined): string {
  return String(text ?? "").trim();
}

function headingPermalinkClass(node: {
  tagName?: string;
  properties?: { className?: unknown; class?: unknown };
}): string {
  const props = node.properties || {};
  const className = props.className;
  if (Array.isArray(className)) return className.join(" ");
  if (typeof className === "string") return className;
  return String(props.class ?? "");
}

function isHeadingPermalink(node: {
  type?: string;
  tagName?: string;
  properties?: { className?: unknown; class?: unknown };
}): boolean {
  if (node.type === "element" && node.tagName === "a") {
    return /\bheading-permalink\b/.test(headingPermalinkClass(node));
  }
  return false;
}

/** Flatten heading AST children so inline markdown/HTML still yields the visible title. */
export function collectHeadingText(node: {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: { className?: unknown; class?: unknown };
  children?: unknown[];
} | null | undefined): string {
  if (!node) return "";
  if (isHeadingPermalink(node)) return "";
  if (typeof node.value === "string" && !Array.isArray(node.children)) {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map((child) => collectHeadingText(child as typeof node)).join("");
  }
  return "";
}
