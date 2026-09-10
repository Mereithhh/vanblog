import { transferRemoteImages } from '@/services/van-blog/api';
import { message, Modal } from 'antd';
import { BytemdPlugin } from 'bytemd';

export function transferRemotePlugin(
  setLoading: (loading: boolean) => void,
  applyContent: (next: string) => void,
): BytemdPlugin {
  return {
    actions: [
      {
        title: '外链图片转存',
        icon,
        handler: {
          type: 'action',
          click(ctx) {
            const current = ctx.editor.getValue();
            Modal.confirm({
              title: '外链图片转存',
              content:
                '将扫描正文中的远程图片（Markdown 与 HTML <img>），下载后存入本站图床并改写链接。已是本站 /static 或图床中的地址、相对路径和 data: 图片会跳过。失败的链接保持原样。是否继续？',
              okText: '开始转存',
              cancelText: '取消',
              async onOk() {
                setLoading(true);
                try {
                  const res = await transferRemoteImages({
                    content: current,
                    siteHost:
                      typeof window !== 'undefined' ? window.location.host : undefined,
                  });
                  const data = res?.data;
                  if (!data) {
                    message.error('转存失败！');
                    return;
                  }
                  if (typeof data.content === 'string' && data.content !== current) {
                    ctx.editor.setValue(data.content);
                    applyContent(data.content);
                  }
                  const transferred = data.transferred?.length || 0;
                  const skipped = data.skipped?.length || 0;
                  const failed = data.failed || [];
                  if (failed.length) {
                    message.warning(
                      `已转存 ${transferred} 张，跳过 ${skipped} 张，失败 ${failed.length} 张：${failed
                        .map((item) => item.url)
                        .join('、')}`,
                    );
                  } else if (transferred === 0) {
                    message.info(`没有需要转存的外链图片（跳过 ${skipped} 张）`);
                  } else {
                    message.success(
                      `已转存 ${transferred} 张外链图片到本站图床（跳过 ${skipped} 张）`,
                    );
                  }
                } catch (err) {
                  message.error('外链图片转存失败！');
                } finally {
                  setLoading(false);
                }
              },
            });
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
width="16"
height="16"
fill="currentColor"
>
<path d="M896 640v192a64 64 0 0 1-64 64H192a64 64 0 0 1-64-64V640h64v192h640V640h64zM512 128l256 256h-160v256h-192V384H256l256-256z"></path>
</svg>`;
