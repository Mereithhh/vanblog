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
export interface PublicAllProp {
  articles: any[];
  categories: any[];
  tags: string[];
  meta: {
    links: any[];
    socials: SocialItem[];
    rewards: any[];
    menus: MenuItem[];
    about: {
      updatedAt: string;
      content: string;
    };
    siteInfo: {
      author: string;
      authorDesc: string;
      authorLogo: string;
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
    };
  };
}
export async function getPublicAll(): Promise<PublicAllProp> {
  try {
    const url = `${config.baseUrl}api/public/all`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data;
  } catch (err) {
    if (process.env.isBuild == "t") {
      console.log("无法连接，采用默认值");
      // 给一个默认的吧。
      return {
        articles: [],
        categories: [],
        tags: [],
        meta: {
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
