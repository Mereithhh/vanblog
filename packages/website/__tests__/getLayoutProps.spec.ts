import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { PublicMetaProp, SiteInfo } from "../api/getAllData";
import {
  getAuthorCardProps,
  getLayoutProps,
} from "../utils/getLayoutProps";
import {
  DEFAULT_ABOUT_TITLE,
  DEFAULT_FRIEND_LINK_APPLY_CONTENT,
  DEFAULT_FRIEND_LINK_INTRO,
} from "../utils/pageCopy";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const completeSiteInfo: SiteInfo = {
  author: "Alice",
  authorDesc: "writes things",
  authorLogo: "/author.svg",
  authorLogoDark: "/author-dark.svg",
  siteLogo: "/logo.svg",
  favicon: "/favicon.ico",
  siteName: "DemoBlog",
  siteDesc: "a demo",
  beianNumber: "ICP-1",
  beianUrl: "https://beian.example",
  gaBeianNumber: "GA-1",
  gaBeianUrl: "https://ga.example",
  gaBeianLogoUrl: "/ga.png",
  payAliPay: "",
  payWechat: "",
  since: "2020-01-01T00:00:00.000Z",
  baseUrl: "https://blog.example",
  baiduAnalysisId: "baidu-id",
  gaAnalysisId: "G-TEST207",
  siteLogoDark: "/logo-dark.svg",
  copyrightAggreement: "CC0",
  showSubMenu: "true",
  showAdminButton: "false",
  headerLeftContent: "siteLogo",
  subMenuOffset: 12,
  showDonateInfo: "true",
  showFriends: "false",
  enableComment: "false",
  defaultTheme: "dark",
  showDonateInAbout: "false",
  enableCustomizing: "false",
  showDonateButton: "false",
  showCopyRight: "false",
  showRSS: "false",
  openArticleLinksInNewWindow: "true",
  showExpirationReminder: "false",
  showEditButton: "false",
  articlesPerPage: 10,
  defaultExpandAllCategories: "true",
  friendLinkIntro: "friends here",
  friendLinkApplyContent: "please email",
  aboutTitle: "About us",
};

const metaOf = (
  siteInfo: Partial<SiteInfo>,
  extras: {
    categories?: string[];
    socials?: PublicMetaProp["meta"]["socials"];
    tags?: string[];
    totalArticles?: number;
    menus?: PublicMetaProp["menus"];
    version?: string;
  } = {}
): PublicMetaProp =>
  ({
    version: extras.version ?? "test",
    tags: extras.tags ?? ["js"],
    totalArticles: extras.totalArticles ?? 3,
    totalWordCount: 0,
    menus: extras.menus,
    meta: {
      links: [],
      socials: extras.socials ?? [],
      rewards: [],
      categories: extras.categories ?? ["随笔"],
      about: { updatedAt: "", content: "" },
      siteInfo,
    },
  } as PublicMetaProp);

describe("siteInfo is required on public meta (#207)", () => {
  it("types siteInfo as a required object with some optional fields", () => {
    const src = readSrc("api/getAllData.ts");
    expect(src).toMatch(/export interface SiteInfo/);
    expect(src).toMatch(/siteInfo:\s*SiteInfo;/);
    expect(src).not.toMatch(/siteInfo\?:\s*SiteInfo/);
    expect(src).toMatch(/showSubMenu\?:/);
    expect(src).toMatch(/headerLeftContent\?:/);
    expect(src).toMatch(/gaAnalysisId\?:/);
  });

  it("reads layout and author-card siteInfo through one local binding", () => {
    const src = readSrc("utils/getLayoutProps.ts");
    expect(src.match(/const siteInfo = data\.meta\.siteInfo;/g)?.length).toBe(
      2
    );
    const withoutLocal = src.replace(
      /const siteInfo = data\.meta\.siteInfo;/g,
      ""
    );
    expect(withoutLocal).not.toMatch(/data\.meta\.siteInfo/);
    expect(src).not.toMatch(/siteInfo\?\./);
  });
});

describe("getLayoutProps / getAuthorCardProps with complete siteInfo (#207)", () => {
  it("maps a normal site without changing public layout defaults", () => {
    const data = metaOf(completeSiteInfo, {
      categories: ["随笔", "教程"],
    });
    const layout = getLayoutProps(data);
    const author = getAuthorCardProps(data);

    expect(layout.siteName).toBe("DemoBlog");
    expect(layout.siteDesc).toBe("a demo");
    expect(layout.favicon).toBe("/favicon.ico");
    expect(layout.logo).toBe("/logo.svg");
    expect(layout.logoDark).toBe("/logo-dark.svg");
    expect(layout.description).toBe("a demo");
    expect(layout.headerLeftContent).toBe("siteLogo");
    expect(layout.showAdminButton).toBe("false");
    expect(layout.showFriends).toBe("false");
    expect(layout.enableCustomizing).toBe("false");
    expect(layout.showCopyRight).toBe("false");
    expect(layout.showDonateButton).toBe("false");
    expect(layout.showRSS).toBe("false");
    expect(layout.showExpirationReminder).toBe("false");
    expect(layout.showEditButton).toBe("false");
    expect(layout.openArticleLinksInNewWindow).toBe("true");
    expect(layout.showSubMenu).toBe("true");
    expect(layout.subMenuOffset).toBe(12);
    expect(layout.copyrightAggreement).toBe("CC0");
    expect(layout.ipcHref).toBe("https://beian.example");
    expect(layout.ipcNumber).toBe("ICP-1");
    expect(layout.gaBeianNumber).toBe("GA-1");
    expect(layout.gaBeianLogoUrl).toBe("/ga.png");
    expect(layout.gaBeianUrl).toBe("https://ga.example");
    expect(layout.since).toBe("2020-01-01T00:00:00.000Z");
    expect(layout.baiduAnalysisID).toBe("baidu-id");
    expect(layout.gaAnalysisID).toBe("G-TEST207");
    expect(layout.enableComment).toBe("false");
    expect(layout.defaultTheme).toBe("dark");
    expect(layout.articlesPerPage).toBe(10);
    expect(layout.defaultExpandAllCategories).toBe("true");
    expect(layout.friendLinkIntro).toBe("friends here");
    expect(layout.friendLinkApplyContent).toBe("please email");
    expect(layout.aboutTitle).toBe("About us");
    expect(layout.categories).toEqual(["随笔", "教程"]);

    expect(author.author).toBe("Alice");
    expect(author.desc).toBe("writes things");
    expect(author.logo).toBe("/author.svg");
    expect(author.logoDark).toBe("/author-dark.svg");
    expect(author.showSubMenu).toBe("true");
    expect(author.showRSS).toBe("false");
    expect(author.postNum).toBe(3);
    expect(author.tagNum).toBe(1);
    expect(author.catelogNum).toBe(2);
  });
});

describe("sparse siteInfo fields do not crash (#207)", () => {
  it("uses existing fallbacks when the public API returns a sparse object", () => {
    // `/api/public/meta` always sends an object: `{ ...(metaDoc?.siteInfo || {}), articlesPerPage }`.
    const data = metaOf({ articlesPerPage: 5 } as SiteInfo, {
      categories: [],
      tags: [],
      totalArticles: 0,
    });

    expect(() => getLayoutProps(data)).not.toThrow();
    expect(() => getAuthorCardProps(data)).not.toThrow();

    const layout = getLayoutProps(data);
    const author = getAuthorCardProps(data);

    expect(layout.showFriends).toBe("true");
    expect(layout.showAdminButton).toBe("true");
    expect(layout.showCopyRight).toBe("true");
    expect(layout.showDonateButton).toBe("true");
    expect(layout.showRSS).toBe("true");
    expect(layout.showExpirationReminder).toBe("true");
    expect(layout.showEditButton).toBe("true");
    expect(layout.openArticleLinksInNewWindow).toBe("false");
    expect(layout.headerLeftContent).toBe("siteName");
    expect(layout.showSubMenu).toBe("false");
    expect(layout.enableCustomizing).toBe("true");
    expect(layout.enableComment).toBe("true");
    expect(layout.defaultTheme).toBe("auto");
    expect(layout.subMenuOffset).toBe(0);
    expect(layout.copyrightAggreement).toBe("BY-NC-SA");
    expect(layout.ipcHref).toBe("");
    expect(layout.ipcNumber).toBe("");
    expect(layout.gaBeianNumber).toBe("");
    expect(layout.gaBeianLogoUrl).toBe("");
    expect(layout.gaBeianUrl).toBe("");
    expect(layout.logo).toBe("");
    expect(layout.logoDark).toBe("");
    expect(layout.baiduAnalysisID).toBe("");
    expect(layout.gaAnalysisID).toBe("");
    expect(layout.description).toBe("");
    expect(layout.articlesPerPage).toBe(5);
    expect(layout.defaultExpandAllCategories).toBe("false");
    expect(layout.friendLinkIntro).toBe(DEFAULT_FRIEND_LINK_INTRO);
    expect(layout.friendLinkApplyContent).toBe(
      DEFAULT_FRIEND_LINK_APPLY_CONTENT
    );
    expect(layout.aboutTitle).toBe(DEFAULT_ABOUT_TITLE);
    expect(layout.since).toEqual(expect.any(String));
    expect(layout.since.length).toBeGreaterThan(0);
    // Required-looking fields stay undefined when omitted — no invented names/icons.
    expect(layout.favicon).toBeUndefined();
    expect(layout.siteName).toBeUndefined();
    expect(layout.siteDesc).toBeUndefined();

    expect(author.author).toBeUndefined();
    expect(author.desc).toBeUndefined();
    expect(author.logo).toBeUndefined();
    expect(author.logoDark).toBe("");
    expect(author.showSubMenu).toBe("false");
    expect(author.showRSS).toBe("true");
  });
});
