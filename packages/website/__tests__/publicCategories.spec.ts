import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { PublicMetaProp } from "../api/getAllData";
import { getAuthorCardProps, getLayoutProps } from "../utils/getLayoutProps";
import {
  isListedPublicCategory,
  listedPublicCategories,
} from "../utils/publicCategories";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const metaOf = (categories: string[]): PublicMetaProp =>
  ({
    version: "test",
    tags: ["js"],
    totalArticles: 3,
    totalWordCount: 100,
    menus: [],
    meta: {
      links: [],
      socials: [],
      rewards: [],
      categories,
      about: { updatedAt: "", content: "about" },
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
        showSubMenu: "true",
      },
    },
  } as PublicMetaProp);

describe("public category hide (#359)", () => {
  it("lists only names present in public meta and keeps visible ones", () => {
    const visible = listedPublicCategories(["随笔", "教程"]);
    expect(visible).toEqual(["随笔", "教程"]);
    expect(isListedPublicCategory("随笔", visible)).toBe(true);
    expect(isListedPublicCategory("教程", visible)).toBe(true);
    expect(isListedPublicCategory("私密", visible)).toBe(false);
    expect(isListedPublicCategory("私密", undefined)).toBe(false);
  });

  it("passes filtered meta.categories to nav and author-card counts", () => {
    const layout = getLayoutProps(metaOf(["随笔", "教程"]));
    const author = getAuthorCardProps(metaOf(["随笔", "教程"]));
    expect(layout.categories).toEqual(["随笔", "教程"]);
    expect(layout.categories).not.toContain("私密");
    expect(author.catelogNum).toBe(2);
  });

  it("wires category pages and nav to the public category list", () => {
    const pageProps = readSrc("utils/getPageProps.ts");
    const categoryPage = readSrc("pages/category/[category].tsx");
    const categoryList = readSrc("pages/category.tsx");
    const nav = readSrc("components/NavBar/index.tsx");

    expect(pageProps).toMatch(/isListedPublicCategory/);
    expect(pageProps).toMatch(/notFound:\s*true/);
    expect(categoryPage).toMatch(/notFound:\s*true/);
    expect(categoryPage).toMatch(/data\.meta\.categories\.map/);
    expect(categoryList).toMatch(/CategoryList/);
    expect(categoryList).toMatch(/sortedArticles=\{props\.sortedArticles\}/);
    expect(nav).toMatch(/props\.categories\.map/);
  });
});

describe("public category order (#152)", () => {
  it("keeps the server-provided custom display order", () => {
    const visible = listedPublicCategories(["深度学习", "Linux运维", "Python"]);
    expect(visible).toEqual(["深度学习", "Linux运维", "Python"]);
    const layout = getLayoutProps(metaOf(["深度学习", "Linux运维", "Python"]));
    expect(layout.categories).toEqual(["深度学习", "Linux运维", "Python"]);
  });
});
