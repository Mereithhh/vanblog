import { parseNavStructure } from "../MarkdownTocBar/tools";
import { hasToc } from "../../utils/hasToc";

export const TOC_DRAWER_OPEN_LABEL = "打开目录";
export const TOC_DRAWER_CLOSE_LABEL = "关闭目录";
export const TOC_DRAWER_TITLE = "目录";
export const TOC_DRAWER_PANEL_ID = "toc-drawer-panel";
export const TOC_DRAWER_FAB_ATTR = "data-toc-fab";
export const TOC_DRAWER_PANEL_ATTR = "data-toc-drawer";
export const TOC_DRAWER_OVERLAY_ATTR = "data-toc-drawer-overlay";
export const TOC_DRAWER_ROOT_CLASS = "toc-drawer-root";
export const TOC_DRAWER_FAB_CLASS = "toc-drawer-fab";
export const TOC_DRAWER_PANEL_CLASS = "toc-drawer-panel";
export const TOC_DRAWER_DESKTOP_MIN_WIDTH = 1024;

export type TocDrawerAction =
  | "open"
  | "close"
  | "toggle"
  | "select"
  | "overlay"
  | "escape";

export function shouldShowMobileTocFab(content: string): boolean {
  return hasToc(content);
}

export function tocDrawerEntries(content: string) {
  return parseNavStructure(content).map((item) => ({
    text: item.text,
    level: item.level,
    index: item.index,
  }));
}

export function reduceTocDrawerOpen(
  open: boolean,
  action: TocDrawerAction
): boolean {
  switch (action) {
    case "open":
      return true;
    case "toggle":
      return !open;
    case "close":
    case "select":
    case "overlay":
    case "escape":
      return false;
    default:
      return open;
  }
}

export function describeTocDrawer(content: string, open: boolean) {
  const entries = tocDrawerEntries(content);
  const showFab = entries.length > 0;
  return {
    showFab,
    open: showFab && open,
    entries,
    fab: {
      tag: "button" as const,
      type: "button" as const,
      ariaLabel: TOC_DRAWER_OPEN_LABEL,
      attr: TOC_DRAWER_FAB_ATTR,
      className: TOC_DRAWER_FAB_CLASS,
    },
    panel: {
      id: TOC_DRAWER_PANEL_ID,
      role: "dialog" as const,
      ariaModal: true,
      ariaLabel: TOC_DRAWER_TITLE,
      attr: TOC_DRAWER_PANEL_ATTR,
      className: TOC_DRAWER_PANEL_CLASS,
    },
  };
}
