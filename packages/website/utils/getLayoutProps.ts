import { defaultMenu, MenuItem, PublicMetaProp } from "../api/getAllData";
import dayjs from "dayjs";
import { AuthorCardProps } from "../components/AuthorCard";
import { checkLogin } from "./auth";
export interface LayoutProps {
  description: string;
  ipcNumber: string;
  since: string;
  ipcHref: string;
  // 公安备案
  gaBeianNumber: string;
  gaBeianUrl: string;
  gaBeianLogoUrl: string;
  copyrightAggreement: string;
  logo: string;
  categories: string[];
  favicon: string;
  siteName: string;
  siteDesc: string;
  baiduAnalysisID: string;
  gaAnalysisID: string;
  logoDark: string;
  version: string;
  menus: MenuItem[];
  showSubMenu: "true" | "false";
  showAdminButton: "true" | "false";
  showFriends: "true" | "false";
  headerLeftContent: "siteLogo" | "siteName";
  enableComment: "true" | "false";
  defaultTheme: "auto" | "dark" | "light";
  enableCustomizing: "true" | "false";
  showDonateButton: "true" | "false";
  showCopyRight: "true" | "false";
  showRSS: "true" | "false";
  showExpirationReminder: "true" | "false";
  openArticleLinksInNewWindow: "true" | "false";
  showEditButton: "true" | "false";
  subMenuOffset: number;
  customCss?: string;
  customScript?: string;
  customHtml?: string;
  customHead?: HeadTag[];
}

export interface HeadTag {
  name: string;
  props: Record<string, string>;
  content: string;
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
  const customSetting: any = { enableCustomizing: "true" };
  if (siteInfo.enableCustomizing && siteInfo.enableCustomizing == "false") {
    customSetting.enableCustomizing = "false";
  }
  if (data?.layout?.css) {
    customSetting.customCss = data?.layout?.css;
  }
  if (data?.layout?.html) {
    customSetting.customHtml = data?.layout?.html;
  }
  if (data?.layout?.head) {
    customSetting.customHead = data?.layout?.head;
  }
  if (data?.layout?.script) {
    customSetting.customScript = data?.layout?.script;
  }
  let showDonateButton = "true";
  let showCopyRight = "true";
  if (siteInfo?.showCopyRight == "false") {
    showCopyRight = "false";
  }
  if (siteInfo?.showDonateButton == "false") {
    showDonateButton = "false";
  }
  let showRSS: "true" | "false" = "true";
  if (data.meta.siteInfo?.showRSS && data.meta.siteInfo?.showRSS == "false") {
    showRSS = "false";
  }
  let showExpirationReminder: "true" | "false" = "true";
  if (
    data.meta.siteInfo?.showExpirationReminder &&
    data.meta.siteInfo?.showExpirationReminder == "false"
  ) {
    showExpirationReminder = "false";
  }
  let showEditButton: "true" | "false" = "true";
  if (
    data.meta.siteInfo?.showEditButton &&
    data.meta.siteInfo?.showEditButton == "false"
  ) {
    showEditButton = "false";
  }
  let openArticleLinksInNewWindow: "true" | "false" = "false";
  if (
    data.meta.siteInfo?.openArticleLinksInNewWindow &&
    data.meta.siteInfo?.openArticleLinksInNewWindow == "true"
  ) {
    openArticleLinksInNewWindow = "true";
  }

  return {
    showFriends,
    version: data?.version || "dev",
    subMenuOffset: siteInfo?.subMenuOffset || 0,
    showAdminButton,
    headerLeftContent,
    copyrightAggreement: siteInfo.copyrightAggreement || "BY-NC-SA",
    ipcHref: siteInfo?.beianUrl || "",
    ipcNumber: siteInfo?.beianNumber || "",
    gaBeianNumber: siteInfo?.gaBeianNumber || "",
    gaBeianLogoUrl: siteInfo?.gaBeianLogoUrl || "",
    gaBeianUrl: siteInfo?.gaBeianUrl || "",
    since: siteInfo?.since || dayjs().toISOString(),
    logo: siteInfo?.siteLogo || "",
    favicon: siteInfo.favicon,
    siteName: siteInfo.siteName,
    siteDesc: siteInfo.siteDesc,
    baiduAnalysisID: siteInfo?.baiduAnalysisId || "",
    gaAnalysisID: siteInfo?.gaAnalysisId || "",
    logoDark: siteInfo?.siteLogoDark || "",
    showExpirationReminder: showExpirationReminder,
    description: siteInfo?.siteDesc || "",
    menus: data?.menus || defaultMenu,
    categories: data.meta.categories,
    showSubMenu: showSubMenu ? "true" : "false",
    enableComment: siteInfo?.enableComment || "true",
    defaultTheme: siteInfo?.defaultTheme || "auto",
    openArticleLinksInNewWindow,
    showCopyRight,
    showDonateButton,
    showRSS,
    showEditButton,
    ...customSetting,
  };
}

export function getAuthorCardProps(data: PublicMetaProp): AuthorCardProps {
  const showSubMenu =
    Boolean(data.meta.categories.length) &&
    data.meta.siteInfo?.showSubMenu == "true";
  let showRSS: "true" | "false" = "true";
  if (data.meta.siteInfo?.showRSS && data.meta.siteInfo?.showRSS == "false") {
    showRSS = "false";
  }
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
    showRSS,
  };
}
