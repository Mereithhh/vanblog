import { useEffect } from "react";
import throttle from "lodash/throttle";
// 监听 postcard 的变化，随着滚动自动给页面加上 anchor
export default function (props: { offset: number }) {
  const handleScroll = (ev: Event) => {
    ev.stopPropagation();
    ev.preventDefault();
    const els = document.querySelectorAll(`.post-title-anchor`);
    els.forEach((el: any) => {
      const top = el.getBoundingClientRect().top;
      const v = Math.abs(props.offset - top);
      if (v <= 4) {
        const id = (el as Element).getAttribute("id");
        // const title = (topEl as Element).getAttribute("data-title");
        if (id) {
          location.hash = id as string;
        }
      }
    });
    // if (Math.abs(topEl.getBoundingClientRect().top) < 4) {
    //   const id = (topEl as Element).getAttribute("id");
    //   // const title = (topEl as Element).getAttribute("data-title");
    //   if (id) {
    //     location.hash = id as string;
    //   }
    // }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
}
