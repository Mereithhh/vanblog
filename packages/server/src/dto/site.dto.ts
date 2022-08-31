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
  payAliPay: string;
  payWechat: string;
  payAliPayDark: string;
  payWechatDark: string;
  since: Date;
  baseUrl: string;
  gaAnalysisId: string;
  baiduAnalysisId: string;
  enableComment?: 'true' | 'false';
  showSubMenu?: 'true' | 'false';
  headerLeftContent?: 'siteLogo' | 'siteName';
  subMenuOffset: number;
  showAdminButton: 'true' | 'false';
  showDonateInfo: 'true' | 'false';
  showFriends: 'true' | 'false';
  showDonateInAbout: 'true' | 'false';
  defaultTheme: 'auto' | 'dark' | 'light';
}
export interface updateUserDto {
  username: string;
  password: string;
}
export type UpdateSiteInfoDto = Partial<SiteInfo> | Partial<updateUserDto>;
