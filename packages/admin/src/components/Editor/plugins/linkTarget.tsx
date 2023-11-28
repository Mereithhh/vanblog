import { BytemdPlugin } from 'bytemd';
import { visit } from 'unist-util-visit';

const aTargetPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      node.properties.target = '_blank';
      node.properties.rel = 'noopener noreferrer';
    }
  });
};

export function LinkTarget(): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(aTargetPlugin),
  };
}
