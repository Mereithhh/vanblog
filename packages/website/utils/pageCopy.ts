/** Defaults match the previous hardcoded friend-link / about page copy. */

export const DEFAULT_FRIEND_LINK_INTRO = "以下是本站的友情链接，排名不分先后：";

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

export const DEFAULT_ABOUT_TITLE = "关于我";

const PAGE_COPY_PLACEHOLDER =
  /\{\{\s*(siteName|description|siteDesc|url|logo)\s*\}\}/g;

export function resolvePageCopy(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim() === "" ? fallback : value;
}

export interface FriendLinkApplyVars {
  siteName: string;
  description: string;
  url: string;
  logo: string;
}

export function interpolatePageCopy(
  template: string,
  vars: FriendLinkApplyVars
): string {
  const values: Record<string, string> = {
    siteName: vars.siteName ?? "",
    description: vars.description ?? "",
    siteDesc: vars.description ?? "",
    url: vars.url ?? "",
    logo: vars.logo ?? "",
  };
  return template.replace(PAGE_COPY_PLACEHOLDER, (_match, key: string) => {
    return values[key] ?? "";
  });
}

export function renderFriendLinkApplyContent(
  value: unknown,
  vars: FriendLinkApplyVars
): string {
  return interpolatePageCopy(
    resolvePageCopy(value, DEFAULT_FRIEND_LINK_APPLY_CONTENT),
    vars
  );
}
