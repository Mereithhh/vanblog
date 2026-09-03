/** Shared heading-anchor text so TOC links and heading `id`/`data-id` stay in sync. */
export function normalizeHeadingText(text: string | null | undefined): string {
  return String(text ?? "").trim();
}

type HeadingNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
} | null | undefined;

function nodeClassNames(node: HeadingNode): string[] {
  const raw = node?.properties?.className;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") return raw.split(/\s+/).filter(Boolean);
  return [];
}

function collectPlainText(node: HeadingNode): string {
  if (!node) return "";
  if (typeof node.value === "string" && !Array.isArray(node.children)) {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map((child) => collectPlainText(child as HeadingNode)).join("");
  }
  return "";
}

function findTexAnnotation(node: HeadingNode): string | undefined {
  if (!node) return undefined;
  if (
    node.type === "element" &&
    String(node.tagName || "").toLowerCase() === "annotation"
  ) {
    const encoding = node.properties?.encoding;
    if (encoding === "application/x-tex") {
      return collectPlainText(node);
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findTexAnnotation(child as HeadingNode);
      if (found != null) return found;
    }
  }
  return undefined;
}

/** Reconstruct `$tex$` / `$$tex$$` from rehype-katex so heading ids stay on source TeX. */
function mathDelimiter(node: HeadingNode): { open: string; close: string } | null {
  const classes = nodeClassNames(node);
  if (classes.includes("katex-html") || classes.includes("katex-mathml")) {
    return null;
  }
  if (classes.includes("math-display") || classes.includes("katex-display")) {
    return { open: "$$", close: "$$" };
  }
  if (classes.includes("math") || classes.includes("katex")) {
    return { open: "$", close: "$" };
  }
  return null;
}

/** Flatten heading AST children so inline markdown/HTML still yields the visible title. */
export function collectHeadingText(node: {
  type?: string;
  value?: string;
  children?: unknown[];
} | null | undefined): string {
  if (!node) return "";
  const headingNode = node as HeadingNode;
  if (headingNode?.type === "element") {
    const delim = mathDelimiter(headingNode);
    if (delim) {
      const tex = findTexAnnotation(headingNode);
      if (tex) {
        return `${delim.open}${tex}${delim.close}`;
      }
    }
  }
  if (typeof node.value === "string" && !Array.isArray(node.children)) {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map((child) => collectHeadingText(child as typeof node)).join("");
  }
  return "";
}
