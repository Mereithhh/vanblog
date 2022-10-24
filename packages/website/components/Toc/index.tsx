import { useEffect, useRef } from "react";
import Headroom from "headroom.js";
import MarkdownTocBar from "../MarkdownTocBar";
export default function (props: {
  content: string;
  showSubMenu: "true" | "false";
  mobileMode?: boolean;
}) {
  const { current } = useRef({ hasInit: false });
  useEffect(() => {
    if (!current.hasInit) {
      const el = document.querySelector("#toc-card");
      if (el) {
        current.hasInit = true;
        const headroom = new Headroom(el, {
          classes: {
            initial: `side-bar${
              props.showSubMenu == "true" ? "" : " no-submenu"
            }`,
            pinned: "side-bar-pinned",
            unpinned: "side-bar-unpinned",
            top: "side-bar-top",
            notTop: "side-bar-not-top",
          },
        });
        headroom.init();
      }
    }
  }, [current]);
  const defaultCls =
    "bg-white w-60 card-shadow dark:card-shadow-dark ml-2 dark:bg-dark overflow-y-auto pb-2";
  const mobileCls = " ml-2 dark:bg-dark  pb-2";
  return (
    <div className="sticky" id="toc-card">
      <div
        id="toc-container"
        className={props.mobileMode ? mobileCls : defaultCls}
        style={props.mobileMode ? undefined : { maxHeight: 450 }}
      >
        <MarkdownTocBar  content={props.content} headingOffset={56} />
      </div>
    </div>
  );
}
