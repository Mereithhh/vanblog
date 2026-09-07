import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  HEADER_ACTION_LABELS,
  describeHeaderActions,
  headerActionIsKeyboardActivatable,
} from "../components/NavBar/a11y";
import {
  activatesWithKey,
  dispatchKeyboardActivation,
  isFocusableActionControl,
} from "../utils/keyboardA11y";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

describe("header action a11y model", () => {
  it("exposes search, theme, RSS, admin, and hamburger with accessible names", () => {
    const controls = describeHeaderActions();
    expect(controls.map((c) => [c.kind, c.ariaLabel, c.tag])).toEqual([
      ["search", "搜索", "button"],
      ["theme", "切换主题", "button"],
      ["rss", "RSS 订阅", "button"],
      ["admin", "管理后台", "a"],
      ["menu", "打开菜单", "button"],
    ]);
    expect(HEADER_ACTION_LABELS).toEqual({
      search: "搜索",
      theme: "切换主题",
      rss: "RSS 订阅",
      admin: "管理后台",
      menu: "打开菜单",
    });
  });

  it("omits RSS / admin when those header slots are hidden", () => {
    const controls = describeHeaderActions({
      showAdmin: false,
      showRss: false,
    });
    expect(controls.map((c) => c.kind)).toEqual(["search", "theme", "menu"]);
  });

  it("makes icon actions focusable buttons and admin a real link", () => {
    for (const control of describeHeaderActions()) {
      expect(control.focusable).toBe(true);
      expect(
        isFocusableActionControl({
          tagName: control.tag,
          type: control.type,
          href: control.href,
        })
      ).toBe(true);
      if (control.tag === "button") {
        expect(control.type).toBe("button");
      }
      if (control.kind === "admin") {
        expect(control.href).toBe("/admin");
      }
    }
  });

  it("activates buttons with Enter and Space, and the admin link with Enter", () => {
    const byKind = Object.fromEntries(
      describeHeaderActions().map((c) => [c.kind, c])
    );

    for (const kind of ["search", "theme", "rss", "menu"] as const) {
      const control = byKind[kind];
      expect(headerActionIsKeyboardActivatable(control, "Enter")).toBe(true);
      expect(headerActionIsKeyboardActivatable(control, " ")).toBe(true);
      expect(headerActionIsKeyboardActivatable(control, "Escape")).toBe(false);
    }

    expect(headerActionIsKeyboardActivatable(byKind.admin, "Enter")).toBe(true);
    expect(headerActionIsKeyboardActivatable(byKind.admin, " ")).toBe(false);
    expect(activatesWithKey("div", "Enter")).toBe(false);
    expect(isFocusableActionControl({ tagName: "DIV" })).toBe(false);
  });

  it("runs the same activate path for Enter/Space on header buttons", () => {
    const opened: string[] = [];
    const fire = (kind: string, key: string) => {
      const control = describeHeaderActions().find((c) => c.kind === kind);
      expect(control).toBeTruthy();
      return dispatchKeyboardActivation(control!.tag, key, () => {
        opened.push(`${kind}:${key}`);
      });
    };

    expect(fire("search", "Enter")).toBe(true);
    expect(fire("search", " ")).toBe(true);
    expect(fire("theme", "Enter")).toBe(true);
    expect(fire("theme", " ")).toBe(true);
    expect(fire("rss", "Enter")).toBe(true);
    expect(fire("rss", " ")).toBe(true);
    expect(fire("menu", "Enter")).toBe(true);
    expect(fire("menu", " ")).toBe(true);
    expect(fire("admin", "Enter")).toBe(true);
    expect(fire("admin", " ")).toBe(false);
    expect(opened).toEqual([
      "search:Enter",
      "search: ",
      "theme:Enter",
      "theme: ",
      "rss:Enter",
      "rss: ",
      "menu:Enter",
      "menu: ",
      "admin:Enter",
    ]);
  });
});

describe("header action markup", () => {
  const nav = readSrc("components/NavBar/index.tsx");
  const theme = readSrc("components/ThemeButton/core.tsx");
  const themePlaceholder = readSrc("components/ThemeButton/index.tsx");
  const rss = readSrc("components/RssButton/index.tsx");
  const admin = readSrc("components/AdminButton/index.tsx");

  it("uses native buttons for search, theme, RSS, and hamburger", () => {
    expect(nav).toMatch(/<button[\s\S]*type="button"[\s\S]*HEADER_ACTION_LABELS\.search/);
    expect(nav).toMatch(/<button[\s\S]*type="button"[\s\S]*HEADER_ACTION_LABELS\.menu/);
    expect(theme).toMatch(/<button[\s\S]*type="button"[\s\S]*HEADER_ACTION_LABELS\.theme/);
    expect(rss).toMatch(/<button[\s\S]*type="button"[\s\S]*HEADER_ACTION_LABELS\.rss/);
    expect(nav).not.toMatch(/<div\s+onClick=\{\(\) => \{\s+setShowSearch/);
    expect(theme).not.toMatch(/<div\s+className="flex items-center cursor-pointer/);
  });

  it("keeps RSS as copy-to-clipboard on a keyboard-accessible button", () => {
    expect(rss).toMatch(/CopyToClipboard/);
    expect(rss).toMatch(/HEADER_ACTION_LABELS\.rss/);
    expect(rss).toMatch(/<button/);
  });

  it("makes admin a real /admin link when shown", () => {
    expect(admin).toMatch(/<a\s+href="\/admin"/);
    expect(admin).toMatch(/HEADER_ACTION_LABELS\.admin/);
    expect(admin).toMatch(/target="_blank"/);
    expect(admin).not.toMatch(/window\.open/);
  });

  it("does not leave a focusable dead target for the theme hydration placeholder", () => {
    expect(themePlaceholder).toMatch(/aria-hidden="true"/);
    expect(themePlaceholder).not.toMatch(/<button/);
    expect(themePlaceholder).not.toMatch(/tabIndex/);
  });
});
