import { useEffect, useState } from "react";
import MarkdownTocBar from "../MarkdownTocBar";
import {
  reduceTocDrawerOpen,
  shouldShowMobileTocFab,
  TOC_DRAWER_CLOSE_LABEL,
  TOC_DRAWER_FAB_ATTR,
  TOC_DRAWER_FAB_CLASS,
  TOC_DRAWER_OPEN_LABEL,
  TOC_DRAWER_OVERLAY_ATTR,
  TOC_DRAWER_PANEL_ATTR,
  TOC_DRAWER_PANEL_CLASS,
  TOC_DRAWER_PANEL_ID,
  TOC_DRAWER_ROOT_CLASS,
  TOC_DRAWER_TITLE,
} from "./model";

export default function TocDrawer(props: { content: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen((current) => reduceTocDrawerOpen(current, "escape"));
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow || "auto";
    };
  }, [open]);

  if (!shouldShowMobileTocFab(props.content)) {
    return null;
  }

  return (
    <div className={`${TOC_DRAWER_ROOT_CLASS} lg:hidden`}>
      <button
        type="button"
        {...{ [TOC_DRAWER_FAB_ATTR]: "" }}
        className={`${TOC_DRAWER_FAB_CLASS} dark:nav-shadow-dark text-gray-600 rounded-xl transform transition-all dark:bg-dark hover:scale-110 fill-dark dark:text-dark`}
        aria-label={TOC_DRAWER_OPEN_LABEL}
        aria-expanded={open}
        aria-controls={TOC_DRAWER_PANEL_ID}
        title={TOC_DRAWER_OPEN_LABEL}
        onClick={() => setOpen((current) => reduceTocDrawerOpen(current, "open"))}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" />
        </svg>
      </button>
      {open ? (
        <>
          <div
            {...{ [TOC_DRAWER_OVERLAY_ATTR]: "" }}
            className="toc-drawer-overlay"
            onClick={() =>
              setOpen((current) => reduceTocDrawerOpen(current, "overlay"))
            }
          />
          <aside
            id={TOC_DRAWER_PANEL_ID}
            {...{ [TOC_DRAWER_PANEL_ATTR]: "" }}
            className={`${TOC_DRAWER_PANEL_CLASS} toc-mobile bg-white dark:bg-dark dark:nav-shadow-dark`}
            role="dialog"
            aria-modal="true"
            aria-label={TOC_DRAWER_TITLE}
          >
            <button
              type="button"
              className="toc-drawer-close text-gray-600 dark:text-dark"
              aria-label={TOC_DRAWER_CLOSE_LABEL}
              title={TOC_DRAWER_CLOSE_LABEL}
              onClick={() =>
                setOpen((current) => reduceTocDrawerOpen(current, "close"))
              }
            >
              ×
            </button>
            <MarkdownTocBar
              content={props.content}
              headingOffset={56}
              mobile
              onNavigate={() =>
                setOpen((current) => reduceTocDrawerOpen(current, "select"))
              }
            />
          </aside>
        </>
      ) : null}
    </div>
  );
}
