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
  walineServerUrl: string;
  gaAnalysisId: string;
  baiduAnalysisId: string;
  showSubMenu?: 'true' | 'false';
  recentArticleIds: number[];
}
export interface updateUserDto {
  username: string;
  password: string;
}
export type UpdateSiteInfoDto = Partial<SiteInfo> | Partial<updateUserDto>;
