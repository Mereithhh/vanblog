import { MenuItem, PublicMetaProp } from "../api/getAllData";
import dayjs from "dayjs";
import { AuthorCardProps } from "../components/AuthorCard";
export interface LayoutProps {
  description: string;
  ipcNumber: string;
  since: string;
  ipcHref: string;
  logo: string;
  categories: string[];
  favicon: string;
  siteName: string;
  siteDesc: string;
  baiduAnalysisID: string;
  gaAnalysisID: string;
  logoDark: string;
  version: string;
  links: MenuItem[];
  showSubMenu: "true" | "false";
  showAdminButton: "true" | "false";
  showFriends: "true" | "false";
  headerLeftContent: "siteLogo" | "siteName";
  enableComment: "true" | "false";
  subMenuOffset: number;
}

export function getLayoutProps(data: PublicMetaProp): LayoutProps {
  const siteInfo = data.meta.siteInfo;
  const showSubMenu =
    Boolean(data.meta.categories.length) && siteInfo?.showSubMenu == "true";
  let headerLeftContent: "siteLogo" | "siteName" = "siteName";
  if (data.meta.siteInfo.siteLogo && siteInfo.headerLeftContent == "siteLogo") {
    headerLeftContent = "siteLogo";
  }
  let showAdminButton: "true" | "false" = "true";
  if (siteInfo.showAdminButton && siteInfo.showAdminButton == "false") {
    showAdminButton = "false";
  }
  let showFriends: "true" | "false" = "true";
  if (siteInfo?.showFriends == "false") {
    showFriends = "false";
  }
  return {
    showFriends,
    version: data?.version || "dev",
    subMenuOffset: siteInfo?.subMenuOffset || 0,
    showAdminButton,
    headerLeftContent,
    ipcHref: siteInfo?.beianUrl || "",
    ipcNumber: siteInfo?.beianNumber || "",
    since: siteInfo?.since || dayjs().format("YYYY-MM-DD"),
    logo: siteInfo?.siteLogo || "",
    favicon: siteInfo.favicon,
    siteName: siteInfo.siteName,
    siteDesc: siteInfo.siteDesc,
    baiduAnalysisID: siteInfo?.baiduAnalysisId || "",
    gaAnalysisID: siteInfo?.gaAnalysisId || "",
    logoDark: siteInfo?.siteLogoDark || "",
    description: siteInfo?.siteDesc || "",
    links: data?.meta?.menus || [],
    categories: data.meta.categories,
    showSubMenu: showSubMenu ? "true" : "false",
    enableComment: siteInfo?.enableComment || "true",
  };
}

export function getAuthorCardProps(data: PublicMetaProp): AuthorCardProps {
  const showSubMenu =
    Boolean(data.meta.categories.length) &&
    data.meta.siteInfo?.showSubMenu == "true";
  return {
    postNum: data.totalArticles,
    tagNum: data.tags.length,
    catelogNum: data.meta.categories.length,
    socials: data.meta.socials,
    author: data.meta.siteInfo.author,
    desc: data.meta.siteInfo.authorDesc,
    logo: data.meta.siteInfo.authorLogo,
    logoDark: data.meta.siteInfo.authorLogoDark || "",
    showSubMenu: showSubMenu ? "true" : "false",
  };
}
