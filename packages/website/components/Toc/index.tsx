import { useEffect, useRef } from "react";
import Headroom from "headroom.js";
import MarkdownTocBar from "../MarkdownTocBar";
export default function (props: {
  content: string;
  showSubMenu: "true" | "false";
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
  return (
    <div className="sticky" id="toc-card">
      <div
        id="toc-container"
        className="bg-white w-60 card-shadow dark:card-shadow-dark ml-2 dark:bg-dark overflow-y-auto pb-2"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <MarkdownTocBar content={props.content} headingOffset={56} />
      </div>
    </div>
  );
}
