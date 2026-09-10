import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { PublicMetaProp } from "../api/getAllData";
import { getLayoutProps } from "../utils/getLayoutProps";
import {
  DEFAULT_ABOUT_TITLE,
  DEFAULT_FRIEND_LINK_APPLY_CONTENT,
  DEFAULT_FRIEND_LINK_INTRO,
  interpolatePageCopy,
  renderFriendLinkApplyContent,
  resolvePageCopy,
} from "../utils/pageCopy";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const metaOf = (siteInfoExtra: Record<string, unknown> = {}): PublicMetaProp =>
  ({
    version: "test",
    tags: [],
    totalArticles: 0,
    totalWordCount: 0,
    menus: [],
    meta: {
      links: [],
      socials: [],
      rewards: [],
      categories: [],
      about: { updatedAt: "", content: "already editable about body" },
      siteInfo: {
        author: "a",
        authorDesc: "d",
        authorLogo: "/l.svg",
        siteLogo: "/s.svg",
        favicon: "/f.svg",
        siteName: "VanBlog",
        siteDesc: "desc",
        beianNumber: "",
        beianUrl: "",
        gaBeianNumber: "",
        gaBeianUrl: "",
        gaBeianLogoUrl: "",
        payAliPay: "",
        payWechat: "",
        since: "",
        baseUrl: "",
        copyrightAggreement: "",
        showDonateInfo: "true",
        showFriends: "true",
        enableComment: "true",
        defaultTheme: "auto",
        enableCustomizing: "true",
        showDonateButton: "true",
        showCopyRight: "true",
        showRSS: "true",
        openArticleLinksInNewWindow: "false",
        showExpirationReminder: "true",
        showEditButton: "false",
        ...siteInfoExtra,
      },
    },
  } as PublicMetaProp);

describe("pageCopy fallbacks (#373)", () => {
  it("defaults to the previous hardcoded friend-link and about copy", () => {
    expect(DEFAULT_FRIEND_LINK_INTRO).toBe("以下是本站的友情链接，排名不分先后：");
    expect(DEFAULT_ABOUT_TITLE).toBe("关于我");
    expect(resolvePageCopy(undefined, DEFAULT_FRIEND_LINK_INTRO)).toBe(
      DEFAULT_FRIEND_LINK_INTRO
    );
    expect(resolvePageCopy("", DEFAULT_FRIEND_LINK_INTRO)).toBe(
      DEFAULT_FRIEND_LINK_INTRO
    );
    expect(resolvePageCopy("   ", DEFAULT_ABOUT_TITLE)).toBe(DEFAULT_ABOUT_TITLE);
  });

  it("renders custom apply markdown and interpolates site placeholders", () => {
    const custom = "申请前先留言。\n名称：{{siteName}} 简介：{{description}}";
    expect(resolvePageCopy(custom, DEFAULT_FRIEND_LINK_APPLY_CONTENT)).toBe(
      custom
    );
    expect(
      interpolatePageCopy(custom, {
        siteName: "Demo",
        description: "hello",
        url: "https://blog.example",
        logo: "https://blog.example/logo.svg",
      })
    ).toBe("申请前先留言。\n名称：Demo 简介：hello");
  });

  it("default apply template still prints 本站信息 after interpolation", () => {
    const rendered = renderFriendLinkApplyContent(undefined, {
      siteName: "VanBlog",
      description: "desc",
      url: "https://blog.example",
      logo: "https://blog.example/logo.svg",
    });
    expect(rendered).toContain("请先添加本站为友链后再申请友链");
    expect(rendered).toContain("名称： VanBlog");
    expect(rendered).toContain("简介： desc");
    expect(rendered).toContain("[https://blog.example](https://blog.example)");
    expect(rendered).toContain(
      "[https://blog.example/logo.svg](https://blog.example/logo.svg)"
    );
    expect(rendered).not.toContain("{{siteName}}");
  });
});

describe("layout props expose resolved page copy (#373)", () => {
  it("falls back when siteInfo omits the new fields", () => {
    const layout = getLayoutProps(metaOf());
    expect(layout.friendLinkIntro).toBe(DEFAULT_FRIEND_LINK_INTRO);
    expect(layout.friendLinkApplyContent).toBe(DEFAULT_FRIEND_LINK_APPLY_CONTENT);
    expect(layout.aboutTitle).toBe(DEFAULT_ABOUT_TITLE);
  });

  it("uses custom text when the setting is set", () => {
    const layout = getLayoutProps(
      metaOf({
        friendLinkIntro: "这些是朋友们的站点：",
        friendLinkApplyContent: "请发邮件申请。站点：{{siteName}}",
        aboutTitle: "About this blog",
      })
    );
    expect(layout.friendLinkIntro).toBe("这些是朋友们的站点：");
    expect(layout.friendLinkApplyContent).toBe("请发邮件申请。站点：{{siteName}}");
    expect(layout.aboutTitle).toBe("About this blog");
    expect(
      renderFriendLinkApplyContent(layout.friendLinkApplyContent, {
        siteName: "VanBlog",
        description: "desc",
        url: "https://x",
        logo: "/l.svg",
      })
    ).toBe("请发邮件申请。站点：VanBlog");
  });

  it("empty strings still fall back so existing sites look unchanged", () => {
    const layout = getLayoutProps(
      metaOf({
        friendLinkIntro: "",
        friendLinkApplyContent: "  ",
        aboutTitle: "",
      })
    );
    expect(layout.friendLinkIntro).toBe(DEFAULT_FRIEND_LINK_INTRO);
    expect(layout.friendLinkApplyContent).toBe(DEFAULT_FRIEND_LINK_APPLY_CONTENT);
    expect(layout.aboutTitle).toBe(DEFAULT_ABOUT_TITLE);
  });
});

describe("front pages read the site-config copy (#373)", () => {
  it("friend-link page renders intro and apply content from layout props", () => {
    const src = readSrc("pages/link.tsx");
    expect(src).toMatch(/props\.layoutProps\.friendLinkIntro/);
    expect(src).toMatch(/renderFriendLinkApplyContent/);
    expect(src).toMatch(/props\.layoutProps\.friendLinkApplyContent/);
    expect(src).not.toMatch(/以下是本站的友情链接，排名不分先后：/);
    expect(src).not.toMatch(/请先添加本站为友链后再申请友链/);
  });

  it("about page title comes from layout props; body stays meta.about.content", () => {
    const src = readSrc("pages/about.tsx");
    expect(src).toMatch(/props\.layoutProps\.aboutTitle/);
    expect(src).toMatch(/props\.about\.content/);
    expect(src).not.toMatch(/title="关于我"/);
    expect(src).not.toMatch(/title=\{"关于我"\}/);
  });
});
