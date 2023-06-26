import { copyImgLink, getImgLink } from '@/pages/Static/img/tools';
import { getClipboardContents } from '@/services/van-blog/clipboard';
import { message } from 'antd';
import { BytemdPlugin } from 'bytemd';
export const uploadImg = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/admin/img/upload?withWaterMark=true', {
      method: 'POST',
      body: formData,
      headers: {
        token: (() => {
          return window.localStorage.getItem('token') || 'null';
        })(),
      },
    });
    const data = await res.json();
    if (data && data.statusCode == 200) {
      const url = getImgLink(data.data.src, false);
      copyImgLink(data.data.src, true, '上传成功！ ');
      return url;
    } else {
      message.error('上传失败！');
      return null;
    }
  } catch (err) {
    message.error('上传失败！');
    return null;
  } finally {
  }
};
export function imgUploadPlugin(setLoading: (loading: boolean) => void): BytemdPlugin {
  return {
    actions: [
      {
        title: '剪切板图片上传',
        icon: icon, // 16x16 SVG icon
        handler: {
          type: 'action',
          click(ctx) {
            setLoading(true);
            getClipboardContents()
              .then((file) => {
                if (file) {
                  uploadImg(file).then((url: string) => {
                    if (url) {
                      const imgs = [{ url: url, alt: file.name, title: file.name }];
                      const pos = ctx.appendBlock(
                        imgs
                          .map(({ url, alt, title }, i) => {
                            return `![${alt}](${url}${title ? ` "${title}"` : ''})`;
                          })
                          .join('\n\n'),
                      );
                      ctx.editor.setSelection(
                        pos,
                        ctx.codemirror.Pos(pos.line + imgs.length * 2 - 2),
                      );
                      ctx.editor.focus();
                    }
                  });
                } else {
                  message.warn('剪切板没的图片！');
                }
              })
              .catch(() => {
                message.warn('剪切板图片上传失败！');
              })
              .finally(() => {
                setLoading(false);
              });
            // to be implement:
            // the `ctx` is an instance of `BytemdEditorContext`, which has
            // several utility methods to help operate the CodeMirror editor state.
            // remember to call `focus` to avoid lost of focus
            // editor.focus()
          },
        },
      },
    ],
  };
}
const icon = `<svg
viewBox="0 0 1024 1024"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
p-id="1689"
width="16"
fill="currentColor"
height="16"
>
<path
  d="M768 128h-50.090667A128 128 0 0 0 597.333333 42.666667h-170.666666a128 128 0 0 0-120.576 85.333333H256a128 128 0 0 0-128 128v597.333333a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128V256a128 128 0 0 0-128-128z m-341.333333 0h170.666666a42.666667 42.666667 0 0 1 0 85.333333h-170.666666a42.666667 42.666667 0 0 1 0-85.333333z m384 725.333333a42.666667 42.666667 0 0 1-42.666667 42.666667H256a42.666667 42.666667 0 0 1-42.666667-42.666667V256a42.666667 42.666667 0 0 1 42.666667-42.666667h50.090667A128 128 0 0 0 426.666667 298.666667h170.666666a128 128 0 0 0 120.576-85.333334H768a42.666667 42.666667 0 0 1 42.666667 42.666667v597.333333z"
  p-id="1690"
></path>
</svg>`;
