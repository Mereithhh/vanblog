import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it, vi } from "vitest";
import TimeLineItem from "../components/TimeLineItem";
import { getLayoutProps } from "../utils/getLayoutProps";
import {
  CATEGORY_COLLAPSE_ALL_LABEL,
  CATEGORY_EXPAND_ALL_LABEL,
  CATEGORY_EXPAND_CHEVRON,
  DEFAULT_EXPAND_ALL_CATEGORIES,
  expandControlAriaExpanded,
  expandControlIcon,
  initialCategoryOpenMap,
  isDefaultExpandAllCategories,
  nextOpenState,
  setAllCategoryOpen,
  toggleCategoryOpen,
} from "../utils/categoryExpand";
import { PublicMetaProp } from "../api/getAllData";

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    createElement("a", { href: props.href }, props.children),
}));

(globalThis as { React?: typeof React }).React = React;

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const article = {
  id: 1,
  title: "随笔一篇",
  createdAt: "2024-03-15T12:00:00.000Z",
  content: "",
  category: "随笔",
  tags: [],
  updatedAt: "2024-03-15T12:00:00.000Z",
  private: false,
};

const metaOf = (defaultExpandAllCategories?: unknown): PublicMetaProp =>
  ({
    version: "test",
    tags: [],
    totalArticles: 1,
    totalWordCount: 0,
    menus: [],
    meta: {
      links: [],
      socials: [],
      rewards: [],
      categories: ["随笔"],
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
        ...(defaultExpandAllCategories !== undefined
          ? { defaultExpandAllCategories }
          : {}),
      },
    },
  } as PublicMetaProp);

describe("category expand helpers (#260)", () => {
  it("defaults to collapsed, matching the previous hardcoded category page", () => {
    expect(DEFAULT_EXPAND_ALL_CATEGORIES).toBe(false);
    expect(isDefaultExpandAllCategories(undefined)).toBe(false);
    expect(isDefaultExpandAllCategories(null)).toBe(false);
    expect(isDefaultExpandAllCategories("false")).toBe(false);
    expect(isDefaultExpandAllCategories(false)).toBe(false);
    expect(isDefaultExpandAllCategories("true")).toBe(true);
    expect(isDefaultExpandAllCategories(true)).toBe(true);
  });

  it("builds per-category open maps and expand-all / collapse-all", () => {
    const names = ["随笔", "教程"];
    expect(initialCategoryOpenMap(names, false)).toEqual({
      随笔: false,
      教程: false,
    });
    expect(initialCategoryOpenMap(names, true)).toEqual({
      随笔: true,
      教程: true,
    });
    expect(setAllCategoryOpen(names, true)).toEqual({
      随笔: true,
      教程: true,
    });
    expect(setAllCategoryOpen(names, false)).toEqual({
      随笔: false,
      教程: false,
    });
    expect(toggleCategoryOpen({ 随笔: false, 教程: true }, "随笔")).toEqual({
      随笔: true,
      教程: true,
    });
    expect(nextOpenState(false)).toBe(true);
    expect(nextOpenState(true)).toBe(false);
  });

  it("uses a chevron, not a plus, as the expand mark", () => {
    expect(CATEGORY_EXPAND_CHEVRON).toBe(">");
    expect(expandControlIcon(false)).toBe(">");
    expect(expandControlIcon(true)).toBe(">");
    expect(CATEGORY_EXPAND_CHEVRON).not.toBe("+");
    expect(expandControlAriaExpanded(false)).toBe("false");
    expect(expandControlAriaExpanded(true)).toBe("true");
    expect(CATEGORY_EXPAND_ALL_LABEL).toBe("全部展开");
    expect(CATEGORY_COLLAPSE_ALL_LABEL).toBe("全部收起");
  });
});

describe("TimeLineItem expand control markup (#260)", () => {
  it("renders a row button with a chevron instead of plus when collapsed", () => {
    const html = renderToStaticMarkup(
      createElement(TimeLineItem, {
        date: "随笔",
        articles: [article],
        defaultOpen: false,
        openArticleLinksInNewWindow: false,
        showYear: true,
      })
    );
    expect(html).toContain("type=\"button\"");
    expect(html).toContain("aria-expanded=\"false\"");
    expect(html).toContain("aria-hidden=\"true\"");
    expect(html).toContain("data-expand-chevron");
    expect(html).toContain(">");
    expect(html).not.toMatch(/>\s*\+\s*</);
    expect(html).toContain("随笔");
    expect(html).toContain("1篇");
    expect(html).toContain("max-height:0");
  });

  it("starts expanded when defaultOpen is true", () => {
    const html = renderToStaticMarkup(
      createElement(TimeLineItem, {
        date: "随笔",
        articles: [article],
        defaultOpen: true,
        openArticleLinksInNewWindow: false,
        showYear: true,
      })
    );
    expect(html).toContain("aria-expanded=\"true\"");
    expect(html).toContain("aria-hidden=\"false\"");
    expect(html).toContain("rotate-90");
    expect(html).toContain("随笔一篇");
    expect(html).not.toMatch(/max-height:0/);
    expect(html).not.toMatch(/>\s*\+\s*</);
  });
});

describe("layout defaultExpandAllCategories (#260)", () => {
  it("defaults to collapsed and honors the site setting", () => {
    expect(getLayoutProps(metaOf()).defaultExpandAllCategories).toBe("false");
    expect(getLayoutProps(metaOf("false")).defaultExpandAllCategories).toBe(
      "false"
    );
    expect(getLayoutProps(metaOf("true")).defaultExpandAllCategories).toBe(
      "true"
    );
  });
});

describe("category page wiring (#260)", () => {
  it("passes the layout default into CategoryList and keeps a chevron control", () => {
    const page = readSrc("pages/category.tsx");
    const list = readSrc("components/CategoryList/index.tsx");
    const item = readSrc("components/TimeLineItem/index.tsx");
    const form = readSrc("../admin/src/components/SiteInfoForm/index.tsx");

    expect(page).toMatch(/CategoryList/);
    expect(page).toMatch(/defaultExpandAll=\{isDefaultExpandAllCategories/);
    expect(page).toMatch(/layoutProps\.defaultExpandAllCategories/);
    expect(page).not.toMatch(/defaultOpen=\{false\}/);

    expect(list).toMatch(/CATEGORY_EXPAND_ALL_LABEL/);
    expect(list).toMatch(/CATEGORY_COLLAPSE_ALL_LABEL/);
    expect(list).toMatch(/data-category-expand-all/);
    expect(list).toMatch(/data-category-collapse-all/);
    expect(list).toMatch(/open=\{Boolean\(openByName\[key\]\)\}/);

    expect(item).toMatch(/aria-expanded=\{visible\}/);
    expect(item).toMatch(/CATEGORY_EXPAND_CHEVRON/);
    expect(item).toMatch(/rotate-90/);
    expect(item).not.toMatch(/>\s*\+\s*</);
    expect(item).toMatch(/type="button"/);

    expect(form).toMatch(/name=\{'defaultExpandAllCategories'\}/);
    expect(form).toMatch(/分类页默认展开全部分类/);
  });
});
