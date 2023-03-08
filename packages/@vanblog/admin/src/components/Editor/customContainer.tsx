import { BytemdPlugin } from 'bytemd';

import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { icons } from './icons';
export function customContainer(): BytemdPlugin {
  return {
    remark: (processer) => processer.use(remarkDirective).use(customContainerPlugin),

    viewerEffect: ({ markdownBody }) => {
      const els = markdownBody.querySelectorAll('.custom-container');
      els.forEach((el) => {
        const type = el.className.replace('custom-container', '').trim();
        const title = el.getAttribute('type');
        const titleEl = document.createElement('p');
        titleEl.className = `custom-container-title ${title}`;

        const icon = icons[type];
        const html = `${icon}<span>${title}</span>`;

        titleEl.innerHTML = html;

        el.insertBefore(titleEl, el.firstChild);
      });
    },
    actions: [
      {
        title: '自定义高亮块',
        icon: '<svg  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3441" width="16" height="16" fill="currentColor"><path d="M157.399245 966.003965a99.435203 99.435203 0 0 1-99.33321-99.287213V668.09133a99.4682 99.4682 0 0 1 99.33321-99.287213h709.322511a99.425203 99.425203 0 0 1 99.282213 99.287213v198.625422a99.393206 99.393206 0 0 1-99.282213 99.287213z m-14.199029-297.912635v198.625422a14.234027 14.234027 0 0 0 14.199029 14.199029h709.322511a14.233027 14.233027 0 0 0 14.19903-14.199029V668.09133a14.266025 14.266025 0 0 0-14.19903-14.19903H157.399245a14.266025 14.266025 0 0 0-14.198029 14.19903z m14.199029-212.824452a99.436203 99.436203 0 0 1-99.33321-99.288212V157.353243a99.4682 99.4682 0 0 1 99.33321-99.287212h709.322511a99.424203 99.424203 0 0 1 99.282213 99.287212v198.625423a99.393206 99.393206 0 0 1-99.282213 99.287212z m-14.198029-297.913635v198.625423a14.233027 14.233027 0 0 0 14.199029 14.199029h709.321511a14.233027 14.233027 0 0 0 14.19903-14.199029V157.353243a14.266025 14.266025 0 0 0-14.19903-14.199029H157.399245a14.267025 14.267025 0 0 0-14.198029 14.199029z" p-id="3442"></path></svg>',
        cheatsheet: `:::info{title="标题"}`,
        handler: {
          type: 'dropdown',
          actions: customContainerActionItems.map(({ title, code }) => {
            return {
              title,
              handler: {
                type: 'action',
                click({ editor, appendBlock, codemirror }) {
                  const { line } = appendBlock(code);
                  editor.setSelection(codemirror.Pos(line + 1, 0), codemirror.Pos(line + 1));
                  editor.focus();
                },
              },
            };
          }),
        },
      },
    ],
  };
}

const customContainerActionItems = [
  {
    title: 'info',
    code: `:::info{title="相关信息"}\n相关信息\n:::`,
  },
  {
    title: 'note',
    code: `:::note{title="注"}\n注\n:::`,
  },
  {
    title: 'warning',
    code: `:::warning{title="注意"}\n注意\n:::`,
  },
  {
    title: 'danger',
    code: `:::danger{title="警告"}\n警告\n:::`,
  },
  {
    title: 'tip',
    code: `:::tip{title="提示"}\n提示\n:::`,
  },
];

const customContainerTitleMap: Record<string, string> = {
  note: '注',
  info: '相关信息',
  warning: '注意',
  danger: '警告',
  tip: '提示',
};
function customContainerPlugin() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        if (node.type == 'containerDirective') {
          const data = node.data || (node.data = {});
          const tagName = node.name;
          data.hName = 'div';
          const { attributes } = node || {};
          const title = attributes?.title || customContainerTitleMap[tagName];
          const cls = `custom-container ${tagName}`;
          data.hProperties = {
            class: cls,
            ['type']: title,
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
