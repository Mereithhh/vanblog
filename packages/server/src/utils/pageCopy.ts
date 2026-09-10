/** Defaults match the previous hardcoded friend-link / about page copy. */

export const DEFAULT_FRIEND_LINK_INTRO = '以下是本站的友情链接，排名不分先后：';

export const DEFAULT_FRIEND_LINK_APPLY_CONTENT = `
**[申领要求]**
- [x] 请先添加本站为友链后再申请友链，并通过留言或邮件告知
- [x] 不和剽窃、侵权、无诚信的网站交换，优先和具有原创作品的全站 HTTPS 站点交换
- [x] 原则上要求您的博客主页被百度或者 Google 等搜索引擎收录
- [x] 由于访问安全性问题，请**务必**提供 HTTPS 链接的头像地址（或留言时备注暂无以便本站主动保存）
- [x] 不接受视频站、资源站等非博客类站点交换，原则上只与技术/日志类博客交换友链

**[本站信息]**
> 名称： {{siteName}}<br/>
> 简介： {{description}}<br/>
> 网址： [{{url}}]({{url}})<br/>
> 头像： [{{logo}}]({{logo}})
`;

export const DEFAULT_ABOUT_TITLE = '关于我';

/**
 * Persist optional page-copy strings from site settings.
 * Non-strings are ignored (keep previous). Empty/whitespace is stored as ''
 * so the front can fall back to the hardcoded default.
 */
export function sanitizePageCopy(value: unknown, previous?: string): string | undefined {
  if (value === undefined) {
    return previous;
  }
  if (value === null) {
    return '';
  }
  if (typeof value !== 'string') {
    return previous;
  }
  return value;
}

export function resolvePageCopy(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  return value.trim() === '' ? fallback : value;
}
