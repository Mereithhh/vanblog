import { useEffect, useRef } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
const sleep = (delay: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};
export default function Editor(props) {
  const { current } = useRef<{ editor: Vditor }>({ editor: null });
  const handleClickMore = async () => {
    current.editor.insertValue('!-- more -->\n');
    await sleep(50);
    current.editor.insertValue('<');
  };
  useEffect(() => {
    if (!current.editor) {
      current.editor = new Vditor('vditor', {
        mode: 'wysiwyg',
        fullscreen: {
          index: 9999,
        },
        preview: {
          delay: 200,
        },
        after: () => {
          props?.setVd(current.editor);
          const el = document.querySelector('.toolbar-more');
          if (el) {
            el.addEventListener('click', handleClickMore);
          }
        },
        toolbar: [
          {
            hotkey: '⌘D',
            name: 'more',
            tipPosition: 's',
            tip: '插入more标记',
            className: 'toolbar-more',
            icon: '<svg t="1659599914178" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2537" width="32" height="32"><path d="M512 958.016c-119.648 0-232.128-46.368-316.736-130.56C110.624 743.2 64 631.2 64 512c0-119.168 46.624-231.2 131.232-315.424 84.608-84.192 197.088-130.56 316.736-130.56s232.128 46.368 316.704 130.56c84.672 84.224 131.264 196.256 131.264 315.392 0.032 119.2-46.592 231.232-131.264 315.456C744.128 911.616 631.648 958.016 512 958.016zM512 129.984c-102.624 0-199.072 39.744-271.584 111.936C167.936 314.048 128 409.984 128 512c0 102.016 39.904 197.952 112.384 270.048 72.512 72.192 168.96 111.936 271.584 111.936 102.592 0 199.072-39.744 271.584-111.936 72.48-72.16 112.416-168.064 112.384-270.08 0-102.016-39.904-197.92-112.384-270.016C711.072 169.76 614.592 129.984 512 129.984zM736 480l-192 0L544 288c0-17.664-14.336-32-32-32s-32 14.336-32 32l0 192L288 480c-17.664 0-32 14.336-32 32s14.336 32 32 32l192 0 0 192c0 17.696 14.336 32 32 32s32-14.304 32-32l0-192 192 0c17.696 0 32-14.336 32-32S753.696 480 736 480z" p-id="2538"></path></svg>',
          },
          'emoji',
          'headings',
          'bold',
          'italic',
          'strike',
          'link',
          '|',
          'list',
          'ordered-list',
          'check',
          'outdent',
          'indent',
          '|',
          'quote',
          'line',
          'code',
          'inline-code',
          'insert-before',
          'insert-after',
          '|',
          'upload',
          'record',
          'table',
          '|',
          'undo',
          'redo',
          '|',
          'fullscreen',
          'edit-mode',
          {
            name: 'more',
            toolbar: [
              'both',
              'code-theme',
              'content-theme',
              'export',
              'outline',
              'preview',
              'devtools',
              'info',
              'help',
            ],
          },
        ],
      });
    }

    return () => {
      if (current.editor && current.editor.destroy) {
        current.editor.destroy();
      }
      const el = document.querySelector('.toolbar-more');
      if (el) {
        el.removeEventListener('click', handleClickMore);
      }
    };
  }, [current]);
  return <div id="vditor" className="vditor" style={{ minHeight: 400 }} />;
}
