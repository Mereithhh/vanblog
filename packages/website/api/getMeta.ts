import { config } from "../utils/loadConfig";
export type SocialType = "bilibili" | "email" | "github" | "wechat";
export interface SocialItem {
  updatedAt: string;
  type: SocialType;
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
    about: {
      updatedAt: Date;
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
    console.log(err);
    throw err;
  }
}
