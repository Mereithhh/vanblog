//@ts-ignore
import data from '@emoji-mart/data';
//@ts-ignore
import i18n from '@emoji-mart/data/i18n/zh.json';
import Picker from '@emoji-mart/react';
import { BytemdPlugin } from 'bytemd';
import { render } from 'react-dom';

const EMOJI_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 1024 1024"><path d="M510.944 960c-247.04 0-448-200.96-448-448s200.992-448 448-448 448 200.96 448 448-200.96 448-448 448zm0-832c-211.744 0-384 172.256-384 384s172.256 384 384 384 384-172.256 384-384-172.256-384-384-384z"/><path d="M512 773.344c-89.184 0-171.904-40.32-226.912-110.624-10.88-13.92-8.448-34.016 5.472-44.896 13.888-10.912 34.016-8.48 44.928 5.472 42.784 54.688 107.136 86.048 176.512 86.048 70.112 0 134.88-31.904 177.664-87.552 10.784-14.016 30.848-16.672 44.864-5.888 14.016 10.784 16.672 30.88 5.888 44.864C685.408 732.32 602.144 773.344 512 773.344zM368 515.2c-26.528 0-48-21.472-48-48v-64c0-26.528 21.472-48 48-48s48 21.472 48 48v64c0 26.496-21.504 48-48 48zm288 0c-26.496 0-48-21.472-48-48v-64c0-26.528 21.504-48 48-48s48 21.472 48 48v64c0 26.496-21.504 48-48 48z"/></svg>';

const handleClick = (event: Event) => {
  event.stopPropagation();
  event.preventDefault();

  const el = document.querySelector('.emoji-container');

  if (el && !el.contains(event.target as HTMLElement)) {
    // ev.target
    // 关了应该

    el.className = 'emoji-container hidden';
    document.removeEventListener('click', handleClick);
  }
};

export const emoji = (): BytemdPlugin => ({
  editorEffect: (ctx) => {
    const el = (
      // @ts-ignore
      <Picker
        i18n={i18n}
        data={data}
        onEmojiSelect={(c) => {
          if (c?.native) {
            ctx.editor.replaceSelection(c?.native);
          }
        }}
      />
    );
    const container = ctx.root.querySelector('.bytemd-toolbar-left');
    const targetEl = document.createElement('div');
    targetEl.className = 'emoji-container hidden';
    // 获取一下 left 的位置
    const actionEl = ctx.root.querySelector(`div[bytemd-tippy-path="18"]`) as any;
    if (actionEl) {
      targetEl.style.left = `${actionEl.offsetLeft}px`;
    }
    container.appendChild(targetEl);
    if (container) {
      render(el, targetEl);
    }
  },
  actions: [
    {
      title: '表情',
      icon: EMOJI_ICON,
      handler: {
        type: 'action',
        click: ({ root }) => {
          const el = root.querySelector('.emoji-container');

          if (el.classList.contains('hidden')) {
            // 显示的话点击外面就关闭
            setTimeout(() => {
              document.addEventListener('click', handleClick);
            }, 100);
          } else {
            document.removeEventListener('click', handleClick);
          }
          if (el) {
            el.classList.toggle('hidden');
          }
        },
      },
    },
  ],
});
