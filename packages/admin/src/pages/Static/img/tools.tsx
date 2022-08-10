import { writeClipBoardText } from '@/services/van-blog/clipboard';
import { message } from 'antd';
import { StaticItem } from '../type';

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
export const mergeMetaInfo = (baseUrl, item: StaticItem) => {
  const Dic = {
    type: '格式',
    height: '高',
    width: '宽',
    name: '名称',
    sign: 'md5',
    storageType: '存储',
    url: '外链',
    size: '大小',
  };
  const KeyDic = {
    local: '本地',
  };
  const rawObj = {
    name: item.name,
    ...item.meta,
    sign: item.sign,
    storageType: item.storageType,
    url: `${baseUrl}/static/${item.staticType}/${item.name}`,
  };
  const res = {};
  for (const [k, v] of Object.entries(rawObj)) {
    res[Dic[k] || k] = KeyDic[v as any] || v;
  }
  return res;
};
