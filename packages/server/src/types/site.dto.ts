export class SiteInfo {
  author: string;
  authorLogo: string;
  authorLogoDark: string;
  authDesc: string;
  siteLogo: string;
  siteLogoDark: string;
  favicon: string;
  siteName: string;
  siteDesc: string;
  beianNumber: string;
  beianUrl: string;
  gaBeianNumber: string;
  gaBeianUrl: string;
  gaBeianLogoUrl: string;
  payAliPay: string;
  payWechat: string;
  payAliPayDark: string;
  payWechatDark: string;
  since: Date;
  baseUrl: string;
  gaAnalysisId: string;
  baiduAnalysisId: string;
  copyrightAggreement: string;
  enableComment?: 'true' | 'false';
  showSubMenu?: 'true' | 'false';
  headerLeftContent?: 'siteLogo' | 'siteName';
  subMenuOffset: number;
  showAdminButton: 'true' | 'false';
  showDonateInfo: 'true' | 'false';
  showFriends: 'true' | 'false';
  showCopyRight: 'true' | 'false';
  showDonateButton: 'true' | 'false';
  showDonateInAbout: 'true' | 'false';
  allowOpenHiddenPostByUrl: 'true' | 'false';
  defaultTheme: 'auto' | 'dark' | 'light';
  enableCustomizing: 'true' | 'false';
  showRSS: 'true' | 'false';
  openArticleLinksInNewWindow: 'true' | 'false';
  showExpirationReminder?: 'true' | 'false';
  showEditButton?: 'true' | 'false';
  /** Front home /page/n list size. Default 5, clamped to 1–50. */
  articlesPerPage?: number;
  /** Friend-link page intro above the cards. Empty/unset keeps the previous hardcoded line. */
  friendLinkIntro?: string;
  /** Friend-link page markdown below the cards. Empty/unset keeps the previous hardcoded apply text. */
  friendLinkApplyContent?: string;
  /** About page title. Empty/unset keeps「关于我」. Body is still edited via 编辑关于. */
  aboutTitle?: string;
}
export interface updateUserDto {
  username: string;
  password: string;
}
export type UpdateSiteInfoDto = Partial<SiteInfo> | Partial<updateUserDto>;
