import MarkdownNavbar from "markdown-navbar";
import { useEffect } from "react";
import Headroom from "headroom.js";
import scroll from "react-scroll";
export default function (props: {
  content: string;
  showSubMenu: "true" | "false";
}) {
  useEffect(() => {
    const el = document.querySelector("#author-card");
    if (el) {
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
  });
  return (
    <div className="fixed" id="author-card">
      <div
        id="toc-container"
        className="bg-white w-60 card-shadow dark:card-shadow-dark ml-2 dark:bg-dark overflow-y-auto pb-2"
        style={{ maxHeight: 450 }}
      >
        <div className="text-center text-lg font-medium mt-4 text-gray-700 dark:text-dark">
          目录
        </div>
        <MarkdownNavbar
          ordered={false}
          declarative={true}
          // updateHashAuto={true}
          source={props.content.replace(/`#/g, "")}
          headingTopOffset={56}
          onHashChange={(newHash, oldHash) => {
            // 判断一下当前激活的元素
            const el = document.querySelector(
              ".markdown-navigation div.active"
            );

            let to = (el as any)?.offsetTop;
            // console.log(to);

            if (to) {
              if (newHash < oldHash) {
                to = to - 100;
              }
              scroll.animateScroll.scrollTo(to, {
                containerId: "toc-container",
                smooth: true,
                delay: 0,
                spyThrottle: 0,
              });
            }
            // console.log(newHash, oldHash, el);
          }}
        />
      </div>
    </div>
  );
}
