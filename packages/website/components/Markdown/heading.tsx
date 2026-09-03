import { BytemdPlugin } from "bytemd";
import { visit } from "unist-util-visit";
import { collectHeadingText, normalizeHeadingText } from "../../utils/headingText";
import { headingHashHref } from "../../utils/headingHash";


const headings = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6'
]

function permalinkClassName(node: {
  properties?: { className?: unknown; class?: unknown };
}): string {
  const props = node.properties || {};
  const className = props.className;
  if (Array.isArray(className)) return className.join(" ");
  if (typeof className === "string") return className;
  return String(props.class ?? "");
}

function hasPermalink(node: { children?: unknown[] }): boolean {
  return (node.children || []).some((child) => {
    const el = child as {
      type?: string;
      tagName?: string;
      properties?: { className?: unknown; class?: unknown };
    };
    return (
      el?.type === "element" &&
      el?.tagName === "a" &&
      /\bheading-permalink\b/.test(permalinkClassName(el))
    );
  });
}

export function isFootnotesHeading(node): boolean {
  const id = node?.properties?.id;
  if (id === "footnote-label" || id === "user-content-footnote-label") {
    return true;
  }
  const className = node?.properties?.className;
  const classes = Array.isArray(className)
    ? className
    : typeof className === "string"
      ? className.split(/\s+/)
      : [];
  return classes.includes("sr-only");
}

export const headingRehypePlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === "element" && headings.includes(node.tagName)) {
      if (isFootnotesHeading(node)) {
        return;
      }
      if (!node.properties) {
        node.properties = {};
      }
      const title = normalizeHeadingText(collectHeadingText(node));
      node.properties['data-id'] = title;
      node.properties['id'] = title;
      node.properties['class'] = 'markdown-heading';
      if (title && !hasPermalink(node)) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push({
          type: "element",
          tagName: "a",
          properties: {
            className: ["heading-permalink"],
            href: headingHashHref(title),
            title,
          },
          children: [{ type: "text", value: "#" }],
        });
      }
    }
  });
}

export function Heading(): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(headingRehypePlugin),
  };
}
