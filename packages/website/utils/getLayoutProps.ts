import { MenuItem, PublicAllProp, PublicMetaProp } from "../api/getAllData";

export interface LayoutProps {
  description: string;
  ipcNumber: string;
  since: string;
  ipcHref: string;
  logo: string;
  categories: string[];
  favicon: string;
  walineServerUrl: string;
  siteName: string;
  siteDesc: string;
  baiduAnalysisID: string;
  gaAnalysisID: string;
  logoDark: string;
  links: MenuItem[];
}

export function getLayoutProps(data: PublicMetaProp): LayoutProps {
  const siteInfo = data.meta.siteInfo;
  return {
    walineServerUrl: siteInfo?.walineServerUrl || "",
    ipcHref: siteInfo?.beianUrl || "",
    ipcNumber: siteInfo?.beianNumber || "",
    since: siteInfo.since,
    logo: siteInfo.siteLogo,
    favicon: siteInfo.favicon,
    siteName: siteInfo.siteName,
    siteDesc: siteInfo.siteDesc,
    baiduAnalysisID: siteInfo?.baiduAnalysisId || "",
    gaAnalysisID: siteInfo?.gaAnalysisId || "",
    logoDark: siteInfo?.siteLogoDark || "",
    description: siteInfo?.siteDesc || "",
    links: data?.meta?.menus || [],
    categories: data.meta.categories,
  };
}

export function getAuthorCardProps(data: PublicMetaProp) {
  return {
    postNum: data.totalArticles,
    tagNum: data.tags.length,
    catelogNum: data.meta.categories.length,
    socials: data.meta.socials,
    author: data.meta.siteInfo.author,
    desc: data.meta.siteInfo.authorDesc,
    logo: data.meta.siteInfo.authorLogo,
    logoDark: data.meta.siteInfo.authorLogoDark || "",
  };
}
