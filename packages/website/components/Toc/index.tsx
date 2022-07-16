import MarkdownNavbar from "markdown-navbar";
// The default style of markdown-navbar should be imported additionally
import { useEffect } from "react";
import Headroom from "headroom.js";
export default function (props: { content: string }) {
  useEffect(() => {
    const el = document.querySelector("#author-card");
    if (el) {
      const headroom = new Headroom(el, {
        classes: {
          initial: "side-bar",
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
      <div className="bg-white w-60 border ml-2">
        <MarkdownNavbar source={props.content} headingTopOffset={56} />
      </div>
    </div>
  );
}
