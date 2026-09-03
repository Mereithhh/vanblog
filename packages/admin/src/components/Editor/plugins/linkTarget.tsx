import { BytemdPlugin } from 'bytemd';
import { visit } from 'unist-util-visit';

export function isInPageHashHref(href: unknown): boolean {
  return typeof href === 'string' && href.startsWith('#');
}

export const linkTargetRehypePlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      if (!node.properties) {
        node.properties = {};
      }
      // Footnote refs/backrefs (and other in-page anchors) must stay on this
      // document. target=_blank would open a new page of the same article.
      if (isInPageHashHref(node.properties.href)) {
        return;
      }
      node.properties.target = '_blank';
      node.properties.rel = 'noopener noreferrer';
    }
  });
};

export function LinkTarget(): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(linkTargetRehypePlugin),
  };
}
