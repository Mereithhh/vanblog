import { BytemdPlugin } from 'bytemd';
import { visit } from 'unist-util-visit';

export function rawHTML(): BytemdPlugin {
  return {
    remark: (p) => p.use(customStylePlugin),
    viewerEffect: ({ markdownBody }) => {
      const rawEls = markdownBody.querySelectorAll('.editor-rawHtml');
      rawEls.forEach((el) => {
        const raw = el.getAttribute('type');
        const c = document.createElement('div');
        c.innerHTML = raw;
        const child = c.children[0];
        const clone = child.cloneNode(true);
        if (child) {
          el.parentNode.replaceChild(clone, el);
        }
      });
    },
  };
}

function customStylePlugin() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'html') {
        const container = document.createElement('div');
        container.innerHTML = node.value;
        const child = container.children[0];
        if (child) {
          const data = node.data || (node.data = {});
          data.hName = child.tagName.toLowerCase();
          data.hProperties = {
            class: 'editor-rawHtml',
            ['type']: node.value,
          };
          return {
            ...node,
            data,
          };
        }
      }
    });
  };
}
