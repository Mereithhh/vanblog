import axios from 'axios';
const urlList = ['/', '/category', '/tag', '/timeline', '/about', '/link'];
const base = 'http://127.0.0.1:3001';
export const activeISR = async () => {
  console.log('尝试触发 ISR');
  for (const each of urlList) {
    activeUrl(each);
  }
  try {
    const { data: res } = await axios.get(
      'http://127.0.0.1:3000/api/public/meta',
    );
    if (res && res.data) {
      const tags = res.data?.tags || [];
      const categories = res.data?.meta?.categories || [];
      if (tags.length > 0) {
        const tag = tags[0];
        activeUrl(`/tag/${tag}`);
      }
      if (categories.length > 0) {
        const category = categories[0];
        activeUrl(`/category/${category}`);
      }
    }
  } catch (err) {}
  // 触发文章
  try {
    const { data: res } = await axios.get(
      'http://127.0.0.1:3000/api/public/timeline',
    );
    if (res && res.data) {
      const keys = Object.keys(res.data);
      if (keys.length > 0) {
        const key = keys[0];
        const keyDatas = res.data[key];
        if (keyDatas?.length > 0) {
          const article = keyDatas[0];
          if (article?.id) {
            activeUrl(`/post/${article.id}`);
          }
        }
      }
    }
  } catch (err) {}
};
const activeUrl = async (url: string) => {
  try {
    await axios.get(encodeURI(base + url));
    console.log('触发增量渲染成功！', url);
  } catch (err) {
    // console.log(err);
    console.log('触发增量渲染失败！', url);
  }
};
