import { config } from "../utils/loadConfig";
export interface PublicAllProp {
  articles: any[];
  categories: any[];
  tags: string[];
  meta: {
    links: any[];
    socials: any[];
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
      since: string;
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
