import { BytemdPlugin } from "bytemd";
import { visit } from "unist-util-visit";


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

const headingPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === "element" && headings.includes(node.tagName)) {
      const title = node.children[0]?.value;
      node.properties['data-id'] = title;
      node.properties['id'] = title;
      node.properties['class'] = 'markdown-heading cursor-pointer';
    }
  });
}

export function Heading(): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(headingPlugin),
    viewerEffect: ({markdownBody}) => {
      const headings = markdownBody.querySelectorAll('.markdown-heading');
      headings.forEach((heading) => {
        heading.removeEventListener('click', onClickHeading);
        heading.addEventListener('click', onClickHeading);
      });
    }
  };
}
