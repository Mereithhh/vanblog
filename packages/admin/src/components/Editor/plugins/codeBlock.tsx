import type { BytemdPlugin } from 'bytemd';
import { visit } from 'unist-util-visit';
import copy from 'copy-to-clipboard';
import { message } from 'antd';
import {
  CODE_BLOCK_LINE_NUMBERS_CLASS,
  applyLineNumbersToCodeNode,
  findFencedCodeNode,
  readFencedCodeText,
} from './codeBlockLines';
// FIXME: Addd Types
const codeBlockPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node.type === 'element' && node.tagName === 'pre') {
      const oldChildren = JSON.parse(JSON.stringify(node.children || []));
      const codeNode = findFencedCodeNode(oldChildren);
      const codeProperties = codeNode && codeNode.properties ? codeNode.properties : {};
      let language = '';
      if (codeProperties.className) {
        const classNames = Array.isArray(codeProperties.className)
          ? codeProperties.className
          : [codeProperties.className];
        for (const each of classNames) {
          if (String(each).startsWith('language-')) {
            language = String(each).replace('language-', '');
            break;
          }
        }
      }
      if (language === 'mermaid') return;
      applyLineNumbersToCodeNode(codeNode);
      // 复制按钮
      const codeCopyBtn = {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'code-copy-btn',
        },
        children: [],
      };
      const languageTag = {
        type: 'element',
        tagName: 'span',
        properties: {
          class: 'language-tag mr-1',
          style: 'line-height: 21px',
        },
        children: [
          {
            type: 'text',
            value: language,
          },
        ],
      };
      // 上方右侧 header
      const headerRight = {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'header-right flex',
          style: 'color: #6f7177',
        },
        children: [languageTag, codeCopyBtn],
      };
      // 包裹的 div
      const wrapperDiv = {
        type: 'element',
        tagName: 'div',
        properties: {
          class: `code-block-wrapper relative ${CODE_BLOCK_LINE_NUMBERS_CLASS}`,
        },
        children: [headerRight, ...oldChildren],
      };
      node.children = [wrapperDiv];
    }
  });
};

const onClickCopyCode = (e: PointerEvent) => {
  const copyBtn = e.target as HTMLElement;
  const codeEl = copyBtn.parentElement?.parentElement?.querySelector('code');
  const code = readFencedCodeText(codeEl);
  copy(code);
  message.success('复制成功');
};

export function customCodeBlock(): BytemdPlugin {
  return {
    rehype: (processor) => processor.use(codeBlockPlugin),
    viewerEffect: ({ markdownBody }) => {
      markdownBody.querySelectorAll('.code-block-wrapper').forEach((codeBlock) => {
        const copyBtn = codeBlock.querySelector('.code-copy-btn');
        if (!copyBtn) {
          return;
        }
        copyBtn.removeEventListener('click', onClickCopyCode);
        copyBtn.addEventListener('click', onClickCopyCode);
      });
    },
  };
}
