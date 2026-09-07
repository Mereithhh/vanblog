/** Markers the public (and shared admin preview) renderer puts on fenced code lines. */
export const CODE_LINE_CLASS = "code-line";
export const CODE_LINE_NUMBER_CLASS = "code-line-number";
export const CODE_LINE_CONTENT_CLASS = "code-line-content";
export const CODE_BLOCK_LINE_NUMBERS_CLASS = "line-numbers";

export type HastLike = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastLike[];
};

function cloneWithChildren(node: HastLike, children: HastLike[]): HastLike {
  return {
    ...node,
    properties: node.properties ? { ...node.properties } : undefined,
    children,
  };
}

/** Split one hast node into per-line chunks (newline starts a new chunk). */
export function splitHastNodeByLines(node: HastLike): HastLike[][] {
  if (node.type === "text") {
    return String(node.value ?? "")
      .split("\n")
      .map((part) => (part === "" ? [] : [{ type: "text", value: part }]));
  }
  if (node.type !== "element" || !Array.isArray(node.children)) {
    return [[node]];
  }
  const lines: HastLike[][] = [[]];
  for (const child of node.children) {
    const chunks = splitHastNodeByLines(child);
    chunks.forEach((chunk, index) => {
      if (index > 0) lines.push([]);
      if (chunk.length === 0) return;
      lines[lines.length - 1].push(cloneWithChildren(node, chunk));
    });
  }
  return lines;
}

export function splitHastChildrenByLines(children: HastLike[]): HastLike[][] {
  const lines: HastLike[][] = [[]];
  for (const child of children || []) {
    const chunks = splitHastNodeByLines(child);
    chunks.forEach((chunk, index) => {
      if (index > 0) lines.push([]);
      lines[lines.length - 1].push(...chunk);
    });
  }
  if (lines.length > 1 && lines[lines.length - 1].length === 0) {
    lines.pop();
  }
  return lines;
}

function lineNumberSpan(n: number): HastLike {
  return {
    type: "element",
    tagName: "span",
    properties: {
      class: CODE_LINE_NUMBER_CLASS,
      className: [CODE_LINE_NUMBER_CLASS],
      ariaHidden: "true",
    },
    children: [{ type: "text", value: String(n) }],
  };
}

function lineContentSpan(children: HastLike[]): HastLike {
  return {
    type: "element",
    tagName: "span",
    properties: {
      class: CODE_LINE_CONTENT_CLASS,
      className: [CODE_LINE_CONTENT_CLASS],
    },
    children: children.length ? children : [{ type: "text", value: "" }],
  };
}

/** Wrap fenced-code children so each line has a visible, aria-hidden number. */
export function wrapCodeChildrenWithLineNumbers(children: HastLike[]): HastLike[] {
  return splitHastChildrenByLines(children).map((lineChildren, index) => {
    const n = index + 1;
    return {
      type: "element",
      tagName: "span",
      properties: {
        class: CODE_LINE_CLASS,
        className: [CODE_LINE_CLASS],
        dataLine: String(n),
      },
      children: [lineNumberSpan(n), lineContentSpan(lineChildren)],
    };
  });
}

export function applyLineNumbersToCodeNode(codeNode: HastLike | undefined | null) {
  if (!codeNode || codeNode.tagName !== "code") return;
  codeNode.children = wrapCodeChildrenWithLineNumbers(codeNode.children || []);
}

/** Copy payload: line contents only, never the gutter numbers. */
export function readFencedCodeText(code: {
  querySelectorAll?: (selector: string) => ArrayLike<{ textContent?: string; innerText?: string }>;
  innerText?: string;
  textContent?: string;
} | null | undefined): string {
  if (!code) return "";
  const lines = code.querySelectorAll?.(`.${CODE_LINE_CONTENT_CLASS}`);
  if (lines && lines.length) {
    return Array.from(lines)
      .map((el) => el.textContent ?? el.innerText ?? "")
      .join("\n");
  }
  return code.innerText ?? code.textContent ?? "";
}
