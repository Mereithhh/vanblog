import { BytemdPlugin } from "bytemd";
import { visit } from "unist-util-visit";
import { collectHeadingText, normalizeHeadingText } from "../../utils/headingText";


const headings = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6'
]

const onClickHeading = (e: any) => {
  const id = e.target.getAttribute('data-id');
  // 改一下 hash
  window.location.hash = `#${id}`;
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
      node.properties['class'] = 'markdown-heading cursor-pointer';
    }
  });
}

export function Heading(): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(headingRehypePlugin),
    viewerEffect: ({markdownBody}) => {
      const headings = markdownBody.querySelectorAll('.markdown-heading');
      headings.forEach((heading) => {
        heading.removeEventListener('click', onClickHeading);
        heading.addEventListener('click', onClickHeading);
      });
    }
  };
}
