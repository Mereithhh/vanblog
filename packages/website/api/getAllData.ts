import { config } from "../utils/loadConfig";
export type SocialType =
  | "bilibili"
  | "email"
  | "github"
  | "wechat"
  | "wechat-dark";
export interface SocialItem {
  updatedAt: string;
  type: SocialType;
  value: string;
  dark?: string;
}
export interface MenuItem {
  name: string;
  value: string;
}
export interface DonateItem {
  name: string;
  value: string;
  updatedAt: string;
}
export interface LinkItem {
  name: string;
  desc: string;
  logo: string;
  url: string;
  updatedAt: string;
}
export interface MetaProps {
  links: LinkItem[];
  socials: SocialItem[];
  rewards: DonateItem[];
  menus: MenuItem[];
  categories: string[];
  about: {
    updatedAt: string;
    content: string;
  };
  siteInfo: {
    author: string;
    authorDesc: string;
    authorLogo: string;
    authorLogoDark?: string;
    siteLogo: string;
    favicon: string;
    siteName: string;
    siteDesc: string;
    beianNumber: string;
    beianUrl: string;
    payAliPay: string;
    payWechat: string;
    payAliPayDark?: string;
    payWechatDark?: string;
    since: string;
    walineServerUrl: string;
    baseUrl: string;
    baiduAnalysisId?: string;
    gaAnalysisId?: string;
    siteLogoDark?: string;
    showSubMenu?: "true" | "false";
    showAdminButton?: "true" | "false";
    headerLeftContent?: "siteLogo" | "siteName";
    subMenuOffset?: number;
  };
}
export interface PublicMetaProp {
  version: string;
  tags: string[];
  totalArticles: number;
  meta: MetaProps;
  totalWordCount: number;
}
export interface PublicAllProp {
  articles: any[];
  categories: any[];
  tags: string[];
  meta: MetaProps;
}
export const version = process.env["VAN_BLOG_VERSION"] || "dev";

export async function getPublicMeta(): Promise<PublicMetaProp> {
  try {
    const url = `${config.baseUrl}api/public/meta`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data;
  } catch (err) {
    if (process.env.isBuild == "t") {
      console.log("无法连接，采用默认值");
      // 给一个默认的吧。
      return {
        version: version,
        totalWordCount: 0,
        tags: [],
        totalArticles: 0,
        meta: {
          categories: [],
          menus: [],
          links: [],
          socials: [],
          rewards: [],
          about: {
            updatedAt: new Date().toISOString(),
            content: "",
          },
          siteInfo: {
            author: "mereith",
            authorDesc: "Life is strange.",
            authorLogo: "",
            siteLogo: "https://pic.mereith.com/2022/07/19/62d5ff079e73e.png",
            favicon: "https://pic.mereith.com/logo.svg",
            siteName: "van blog",
            siteDesc: "van blog",
            beianNumber: "123",
            beianUrl: "",
            payAliPay: "",
            payWechat: "",
            payAliPayDark: "",
            payWechatDark: "",
            since: "",
            walineServerUrl: "",
            baseUrl: "",
          },
        },
      };
    } else {
      throw err;
    }
  }
}
