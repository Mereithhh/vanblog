import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseNavStructure } from "../components/MarkdownTocBar/tools";
import {
  describeTocDrawer,
  reduceTocDrawerOpen,
  shouldShowMobileTocFab,
  tocDrawerEntries,
  TOC_DRAWER_CLOSE_LABEL,
  TOC_DRAWER_DESKTOP_MIN_WIDTH,
  TOC_DRAWER_FAB_ATTR,
  TOC_DRAWER_FAB_CLASS,
  TOC_DRAWER_OPEN_LABEL,
  TOC_DRAWER_OVERLAY_ATTR,
  TOC_DRAWER_PANEL_ATTR,
  TOC_DRAWER_PANEL_CLASS,
  TOC_DRAWER_PANEL_ID,
  TOC_DRAWER_ROOT_CLASS,
  TOC_DRAWER_TITLE,
} from "../components/TocDrawer/model";
import { hasToc } from "../utils/hasToc";

const websiteRoot = path.join(__dirname, "..");
const readSrc = (rel: string) =>
  readFileSync(path.join(websiteRoot, rel), "utf8");

const WITH_HEADINGS = `# Intro

lead

## Nested Title

body
`;

const WITHOUT_HEADINGS = "just a paragraph\n\nand another line";

describe("mobile TOC FAB visibility", () => {
  it("hides the FAB when the article has no headings / TOC", () => {
    expect(hasToc(WITHOUT_HEADINGS)).toBe(false);
    expect(shouldShowMobileTocFab(WITHOUT_HEADINGS)).toBe(false);
    expect(tocDrawerEntries(WITHOUT_HEADINGS)).toEqual([]);
    expect(describeTocDrawer(WITHOUT_HEADINGS, true)).toMatchObject({
      showFab: false,
      open: false,
      entries: [],
    });
  });

  it("shows the FAB and lists TOC entries when headings exist", () => {
    expect(hasToc(WITH_HEADINGS)).toBe(true);
    expect(shouldShowMobileTocFab(WITH_HEADINGS)).toBe(true);
    const entries = tocDrawerEntries(WITH_HEADINGS);
    expect(entries.map((item) => item.text)).toEqual(["Intro", "Nested Title"]);
    expect(entries).toEqual(
      parseNavStructure(WITH_HEADINGS).map((item) => ({
        text: item.text,
        level: item.level,
        index: item.index,
      }))
    );
    const closed = describeTocDrawer(WITH_HEADINGS, false);
    expect(closed.showFab).toBe(true);
    expect(closed.open).toBe(false);
    expect(closed.entries.map((item) => item.text)).toEqual([
      "Intro",
      "Nested Title",
    ]);
  });
});

describe("mobile TOC drawer open / close", () => {
  it("opens from the FAB and closes on overlay, escape, close, or heading select", () => {
    expect(reduceTocDrawerOpen(false, "open")).toBe(true);
    expect(reduceTocDrawerOpen(false, "toggle")).toBe(true);
    expect(reduceTocDrawerOpen(true, "toggle")).toBe(false);
    expect(reduceTocDrawerOpen(true, "close")).toBe(false);
    expect(reduceTocDrawerOpen(true, "overlay")).toBe(false);
    expect(reduceTocDrawerOpen(true, "escape")).toBe(false);
    expect(reduceTocDrawerOpen(true, "select")).toBe(false);
    expect(reduceTocDrawerOpen(false, "select")).toBe(false);
  });

  it("keeps the drawer closed when there is no TOC even if open is requested", () => {
    const next = reduceTocDrawerOpen(false, "open");
    expect(next).toBe(true);
    expect(describeTocDrawer(WITHOUT_HEADINGS, next).open).toBe(false);
    expect(describeTocDrawer(WITH_HEADINGS, next).open).toBe(true);
  });
});

describe("mobile TOC drawer markup", () => {
  const drawer = readSrc("components/TocDrawer/index.tsx");
  const postCard = readSrc("components/PostCard/index.tsx");
  const tocBar = readSrc("components/MarkdownTocBar/index.tsx");
  const tocCore = readSrc("components/MarkdownTocBar/core.tsx");
  const tocCss = readSrc("styles/toc.css");
  const backToTopCss = readSrc("styles/back-to-top.module.css");
  const desktopToc = readSrc("components/Toc/index.tsx");

  it("reuses MarkdownTocBar and only mounts on article pages that already have a TOC", () => {
    expect(postCard).toMatch(/import TocDrawer from "\.\.\/TocDrawer"/);
    expect(postCard).toMatch(/showToc && <TocDrawer content=\{calContent\} \/>/);
    expect(drawer).toMatch(/shouldShowMobileTocFab\(props\.content\)/);
    expect(drawer).toMatch(/<MarkdownTocBar/);
    expect(drawer).toMatch(/onNavigate=\{\(\) =>/);
    expect(tocBar).toMatch(/onNavigate\?: \(item: NavItem\) => void/);
    expect(tocCore).toMatch(/props\.onNavigate\?\.\(each\)/);
  });

  it("uses a native FAB above back-to-top and a right-side dialog", () => {
    expect(drawer).toContain(`aria-label={TOC_DRAWER_OPEN_LABEL}`);
    expect(drawer).toContain(`type="button"`);
    expect(drawer).toContain(TOC_DRAWER_FAB_ATTR);
    expect(drawer).toContain(TOC_DRAWER_PANEL_ATTR);
    expect(drawer).toContain(TOC_DRAWER_OVERLAY_ATTR);
    expect(drawer).toContain(TOC_DRAWER_ROOT_CLASS);
    expect(drawer).toContain("lg:hidden");
    expect(drawer).toContain('role="dialog"');
    expect(drawer).toContain(`aria-label={TOC_DRAWER_TITLE}`);
    expect(TOC_DRAWER_OPEN_LABEL).toBe("打开目录");
    expect(TOC_DRAWER_CLOSE_LABEL).toBe("关闭目录");
    expect(TOC_DRAWER_TITLE).toBe("目录");
    expect(TOC_DRAWER_PANEL_ID).toBe("toc-drawer-panel");
    expect(TOC_DRAWER_FAB_CLASS).toBe("toc-drawer-fab");
    expect(TOC_DRAWER_PANEL_CLASS).toBe("toc-drawer-panel");
  });

  it("matches the existing FAB size/shadow and sits above back-to-top", () => {
    expect(backToTopCss).toMatch(/bottom:\s*2rem/);
    expect(backToTopCss).toMatch(/width:\s*42px/);
    expect(backToTopCss).toMatch(/height:\s*42px/);
    expect(tocCss).toMatch(/bottom:\s*calc\(2rem \+ 42px \+ 12px\)/);
    expect(tocCss).toMatch(/\.toc-drawer-fab[\s\S]*width:\s*42px/);
    expect(tocCss).toMatch(/\.toc-drawer-fab[\s\S]*height:\s*42px/);
    expect(tocCss).toMatch(
      new RegExp(
        `@media \\(min-width:\\s*${TOC_DRAWER_DESKTOP_MIN_WIDTH}px\\)[\\s\\S]*\\.toc-drawer-root`
      )
    );
    expect(drawer).toMatch(/dark:bg-dark/);
    expect(drawer).toMatch(/dark:nav-shadow-dark/);
  });

  it("does not change the desktop sticky TOC card", () => {
    expect(desktopToc).toMatch(/id="toc-card"/);
    expect(desktopToc).toMatch(/id="toc-container"/);
    expect(desktopToc).toMatch(/<MarkdownTocBar content=\{props\.content\} headingOffset=\{56\} \/>/);
    expect(desktopToc).not.toMatch(/TocDrawer/);
  });
});
