import { writeClipBoardText } from '@/services/van-blog/clipboard';
import { message } from 'antd';

export const copyImgLink = (baseUrl, src, isMarkdown = false) => {
  let url = `${baseUrl}/static/${src}`;
  if (isMarkdown) {
    url = `![](${url})`;
  }
  writeClipBoardText(url).then((res) => {
    if (res) {
      message.success(`已复制${isMarkdown ? 'markdown' : '图片'}链接到剪切板！`);
    } else {
      message.error('复制链接到剪切板失败！');
    }
  });
};
