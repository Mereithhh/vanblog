import { copyImgLink, getImgLink } from '@/pages/Static/img/tools';
import { getClipboardContents } from '@/services/van-blog/clipboard';
import { message, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
const sleep = (delay: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};
const defaultToolBar = [
  {
    name: 'more',
    tipPosition: 'ne',
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
  {
    name: 'clipUpload',
    tipPosition: 'n',
    tip: '剪切板图片上传',
    className: 'toolbar-clip-upload',
    icon: '<svg  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2286" width="32" height="32"><path d="M704 341.333333h64a64 64 0 0 1 64 64v362.666667a64 64 0 0 1-64 64H256a64 64 0 0 1-64-64V405.333333a64 64 0 0 1 64-64h64v64h-64v362.666667h512V405.333333h-64v-64zM517.653333 124.629333l150.826667 150.826667-45.226667 45.269333-74.026666-74.005333v304.768h-64V247.616l-73.173334 73.130667-45.248-45.248 150.826667-150.848z" p-id="2287"></path></svg>',
  },
  'upload',
  'table',
  '|',
  'undo',
  'redo',
  '|',
  'fullscreen',
  'edit-mode',
  'export',
  'outline',
  'preview',
];
const mobileToolBar = [
  {
    name: 'more',
    tipPosition: 'ne',
    tip: '插入more标记',
    className: 'toolbar-more',
    icon: '<svg t="1659599914178" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2537" width="32" height="32"><path d="M512 958.016c-119.648 0-232.128-46.368-316.736-130.56C110.624 743.2 64 631.2 64 512c0-119.168 46.624-231.2 131.232-315.424 84.608-84.192 197.088-130.56 316.736-130.56s232.128 46.368 316.704 130.56c84.672 84.224 131.264 196.256 131.264 315.392 0.032 119.2-46.592 231.232-131.264 315.456C744.128 911.616 631.648 958.016 512 958.016zM512 129.984c-102.624 0-199.072 39.744-271.584 111.936C167.936 314.048 128 409.984 128 512c0 102.016 39.904 197.952 112.384 270.048 72.512 72.192 168.96 111.936 271.584 111.936 102.592 0 199.072-39.744 271.584-111.936 72.48-72.16 112.416-168.064 112.384-270.08 0-102.016-39.904-197.92-112.384-270.016C711.072 169.76 614.592 129.984 512 129.984zM736 480l-192 0L544 288c0-17.664-14.336-32-32-32s-32 14.336-32 32l0 192L288 480c-17.664 0-32 14.336-32 32s14.336 32 32 32l192 0 0 192c0 17.696 14.336 32 32 32s32-14.304 32-32l0-192 192 0c17.696 0 32-14.336 32-32S753.696 480 736 480z" p-id="2538"></path></svg>',
  },
  'headings',
  'bold',
  'link',
  'table',
  'list',
  'check',
  'inline-code',
  'undo',
  'redo',
  {
    name: 'clipUpload',
    tipPosition: 'n',
    tip: '剪切板图片上传',
    className: 'toolbar-clip-upload',
    icon: '<svg  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2286" width="32" height="32"><path d="M704 341.333333h64a64 64 0 0 1 64 64v362.666667a64 64 0 0 1-64 64H256a64 64 0 0 1-64-64V405.333333a64 64 0 0 1 64-64h64v64h-64v362.666667h512V405.333333h-64v-64zM517.653333 124.629333l150.826667 150.826667-45.226667 45.269333-74.026666-74.005333v304.768h-64V247.616l-73.173334 73.130667-45.248-45.248 150.826667-150.848z" p-id="2287"></path></svg>',
  },
  'upload',
];

export default function Editor(props) {
  const { sysTheme } = props;
  const initTheme = sysTheme;
  const { current } = useRef<{ editor: Vditor }>({ editor: null });
  const [loading, setLoading] = useState(false);
  const handleClickMore = async () => {
    current.editor.insertValue('!-- more -->\n');
    await sleep(50);
    current.editor.insertValue('<');
  };
  const handleClickUpload = async () => {
    setLoading(true);
    const fileObj = await getClipboardContents();
    if (!fileObj) {
      message.warning('剪切板没得图片！');
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', fileObj);
    fetch('/api/admin/img/upload', {
      method: 'POST',
      body: formData,
      headers: {
        token: (() => {
          return window.localStorage.getItem('token') || 'null';
        })(),
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.statusCode == 200) {
          handleUploadSucc(res.data);
        } else {
          message.error('上传失败！');
          // console.log(res);
        }
      })
      .catch((err) => {
        message.error('上传失败！');
        // console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleUploadSucc = async (res) => {
    const url = getImgLink(res.src);
    current.editor.insertValue(`\n![](${url})\n`);
    await sleep(50);
    copyImgLink(res.src, true);
  };
  const handleClickChangeModeSW = (ev) => {
    localStorage.setItem('vditorMode', 'wysiwyg');
    // console.log('sw');
  };
  const handleClickChangeModeIR = (ev) => {
    localStorage.setItem('vditorMode', 'ir');
    // console.log('ir');
  };
  const handleClickChangeModeSV = (ev) => {
    localStorage.setItem('vditorMode', 'sv');
    // console.log('sv');
  };
  useEffect(() => {
    if (!current.editor) {
      current.editor = new Vditor('vditor', {
        mode: (window.localStorage.getItem('vditorMode') as any) || 'wysiwyg',
        fullscreen: {
          index: 9999,
        },

        preview: {
          delay: 200,
          hljs: {
            style: initTheme == 'light' ? 'github' : 'native',
          },
        },
        after: () => {
          props?.setVd(current.editor);
          const elMore = document.querySelector('.toolbar-more');
          if (elMore) {
            elMore.addEventListener('click', handleClickMore);
          }
          const elUpload = document.querySelector('.toolbar-clip-upload');
          if (elUpload) {
            elUpload.addEventListener('click', handleClickUpload);
          }
          const swBtn = document.querySelector('button[data-mode="wysiwyg"]');
          if (swBtn) {
            swBtn.addEventListener('click', handleClickChangeModeSW);
          }
          const irBtn = document.querySelector('button[data-mode="ir"]');
          if (irBtn) {
            irBtn.addEventListener('click', handleClickChangeModeIR);
          }
          const svBtn = document.querySelector('button[data-mode="sv"]');
          if (svBtn) {
            svBtn.addEventListener('click', handleClickChangeModeSV);
          }
        },
        upload: {
          handler(files) {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', files[0]);
            return fetch('/api/admin/img/upload', {
              method: 'POST',
              body: formData,
              headers: {
                token: (() => {
                  return window.localStorage.getItem('token') || 'null';
                })(),
              },
            })
              .then((res) => {
                return res.json();
              })
              .then((res) => {
                if (res.statusCode == 200) {
                  handleUploadSucc(res.data);
                  return null;
                } else {
                  message.error('上传失败！');
                  // console.log(res);
                  return null;
                }
              })
              .catch((err) => {
                message.error('上传失败！');
                // console.log(err);
                return null;
              })
              .finally(() => {
                setLoading(false);
              });
          },
        },
        toolbarConfig: {
          pin: true,
        },
        toolbar: window.innerWidth > 500 ? defaultToolBar : mobileToolBar,
        cache: {
          enable: false,
        },
        counter: {
          enable: true,
        },
        height: '100%',
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
      const elUpload = document.querySelector('.toolbar-clip-upload');
      if (elUpload) {
        elUpload.removeEventListener('click', handleClickUpload);
      }
      const swBtn = document.querySelector('button[data-mode="wysiwyg"]');
      if (swBtn) {
        swBtn.removeEventListener('click', handleClickChangeModeSW);
      }
      const irBtn = document.querySelector('button[data-mode="ir"]');
      if (irBtn) {
        irBtn.removeEventListener('click', handleClickChangeModeIR);
      }
      const svBtn = document.querySelector('button[data-mode="sv"]');
      if (svBtn) {
        svBtn.removeEventListener('click', handleClickChangeModeSV);
      }
    };
  }, [current]);
  return (
    // <RcResizeObserver
    //   key="resize-observer-editor"
    //   onResize={(offset) => {
    //     const r = offset.width < 750;
    //     if (r) {
    //       setToolbar(mobileToolBar);
    //     } else {
    //       setToolbar(defaultToolBar);
    //     }
    //     //  小屏幕的话把默认的 col keys 删掉一些
    //   }}
    // >
    <Spin spinning={loading}>
      <div id="vditor" className="vditor" style={{ minHeight: '500px' }} />
    </Spin>
    // </RcResizeObserver>
  );
}
