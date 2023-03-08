import throttle from "lodash/throttle";
import React, { useEffect, useState } from "react";

import style from "../../styles/back-to-top.module.css";
import { scrollTo } from "../../utils/scroll";

const getScrollTop = (): number =>
  window.pageYOffset ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0;

const scrollToTop = () =>
  scrollTo(window, {
    top: 0,
    easing: "ease-in-out",
    duration: 800,
  });

export default () => {
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    const onScroll = throttle((event: any) => {
      event.stopPropagation();
      event.preventDefault();

      setDisplay(getScrollTop() > 300);
    }, 500);

    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, [display]);

  return (
    <>
      {display && (
        <div
          title="返回顶部"
          className={`${style.backToTop} dark:nav-shadow-dark text-gray-600 rounded-xl transform  transition-all  dark:bg-dark hover:scale-110 fill-dark dark:text-dark`}
          onClick={scrollToTop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path d="M512 843.2c-36.2 0-66.4-13.6-85.8-21.8-10.8-4.6-22.6 3.6-21.8 15.2l7 102c.4 6.2 7.6 9.4 12.6 5.6l29-22c3.6-2.8 9-1.8 11.4 2l41 64.2c3 4.8 10.2 4.8 13.2 0l41-64.2c2.4-3.8 7.8-4.8 11.4-2l29 22c5 3.8 12.2.6 12.6-5.6l7-102c.8-11.6-11-20-21.8-15.2-19.6 8.2-49.6 21.8-85.8 21.8z" />
            <path d="m795.4 586.2-96-98.2C699.4 172 513 32 513 32S324.8 172 324.8 488l-96 98.2c-3.6 3.6-5.2 9-4.4 14.2L261.2 824c1.8 11.4 14.2 17 23.6 10.8L419 744s41.4 40 94.2 40c52.8 0 92.2-40 92.2-40l134.2 90.8c9.2 6.2 21.6.6 23.6-10.8l37-223.8c.4-5.2-1.2-10.4-4.8-14zM513 384c-34 0-61.4-28.6-61.4-64s27.6-64 61.4-64c34 0 61.4 28.6 61.4 64S547 384 513 384z" />
          </svg>
        </div>
      )}
    </>
  );
};
