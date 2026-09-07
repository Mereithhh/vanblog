import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { pageCount } from "../components/PageNav/core";
import { getLayoutProps } from "../utils/getLayoutProps";
import {
  DEFAULT_ARTICLES_PER_PAGE,
  MAX_ARTICLES_PER_PAGE,
  MIN_ARTICLES_PER_PAGE,
  sanitizeArticlesPerPage,
} from "../utils/articlesPerPage";
import { PublicMetaProp } from "../api/getAllData";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const metaOf = (articlesPerPage?: unknown): PublicMetaProp =>
  ({
    version: "test",
    tags: [],
    totalArticles: 23,
    totalWordCount: 0,
    menus: [],
    meta: {
      links: [],
      socials: [],
      rewards: [],
      categories: [],
      about: { updatedAt: "", content: "" },
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
        ...(articlesPerPage !== undefined ? { articlesPerPage } : {}),
      },
    },
  } as PublicMetaProp);

describe("sanitizeArticlesPerPage (#346)", () => {
  it("defaults to the previous hardcoded page size of 5", () => {
    expect(DEFAULT_ARTICLES_PER_PAGE).toBe(5);
    expect(sanitizeArticlesPerPage(undefined)).toBe(5);
    expect(sanitizeArticlesPerPage(null)).toBe(5);
    expect(sanitizeArticlesPerPage("")).toBe(5);
    expect(sanitizeArticlesPerPage(NaN)).toBe(5);
  });

  it("clamps below 1 and above 50", () => {
    expect(MIN_ARTICLES_PER_PAGE).toBe(1);
    expect(MAX_ARTICLES_PER_PAGE).toBe(50);
    expect(sanitizeArticlesPerPage(10)).toBe(10);
    expect(sanitizeArticlesPerPage(0)).toBe(1);
    expect(sanitizeArticlesPerPage(9999)).toBe(50);
  });
});

describe("layout / pagination honor articlesPerPage (#346)", () => {
  it("puts the sanitized size on layout props for PageNav", () => {
    expect(getLayoutProps(metaOf()).articlesPerPage).toBe(5);
    expect(getLayoutProps(metaOf(10)).articlesPerPage).toBe(10);
    expect(getLayoutProps(metaOf(999)).articlesPerPage).toBe(50);
  });

  it("changes how many pages a list of N articles produces", () => {
    expect(pageCount(23, 5)).toBe(5);
    expect(pageCount(23, 10)).toBe(3);
    expect(pageCount(5, 5)).toBe(1);
    expect(pageCount(5, 10)).toBe(1);
  });
});

describe("front list wiring uses site articlesPerPage (#346)", () => {
  it("home and /page/n fetch the configured size instead of hardcoded 5", () => {
    const src = readSrc("utils/getPageProps.ts");
    expect(src).toMatch(/sanitizeArticlesPerPage\(/);
    expect(src).toMatch(/pageSize,\s*\n\s*\}/);
    expect(src).not.toMatch(/pageSize:\s*5/);
  });

  it("PageNav on home and /page/n receives layoutProps.articlesPerPage", () => {
    const index = readSrc("pages/index.tsx");
    const page = readSrc("pages/page/[p].tsx");
    expect(index).toMatch(/pageSize=\{props\.layoutProps\.articlesPerPage\}/);
    expect(page).toMatch(/pageSize=\{props\.layoutProps\.articlesPerPage\}/);
  });

  it("ISR getStaticPaths uses the configured size, not / 5", () => {
    const src = readSrc("pages/page/[p].tsx");
    expect(src).toMatch(/sanitizeArticlesPerPage/);
    expect(src).toMatch(/pageCount\(data\.totalArticles,\s*pageSize\)/);
    expect(src).not.toMatch(/totalArticles \/ 5/);
  });
});
