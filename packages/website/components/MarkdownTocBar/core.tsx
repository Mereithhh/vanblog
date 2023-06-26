import { useEffect, useState } from "react";
import throttle from "lodash/throttle";
import { getEl, NavItem } from "./tools";
import { scrollTo } from "../../utils/scroll";
export default function (props: {
  items: NavItem[];
  headingOffset: number;
  mobile?: boolean;
}) {
  const { items } = props;
  const [currIndex, setCurrIndex] = useState(-1);

  const updateHash = (hash: string) => {
    if (hash) {
      window.history.replaceState(null, "", `#${hash}`);
    }
  }
  const handleScroll = throttle((ev: Event) => {
    ev.stopPropagation();
    ev.preventDefault();

    let top: any = null;
    let topEl: any = null;
    let lastMin = 9999999999;
    for (const each of items) {
      const el: any = getEl(each, items);

      if (!topEl) {
        top = each;
        topEl = el;
      }
      if (el) {
        const scrollTop =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
        const v = Math.abs(scrollTop + props.headingOffset - el.offsetTop);
        if (v <= lastMin) {
          lastMin = v;
          top = each;
          topEl = el;
        }
      }
    }
    setCurrIndex(top.index);
    updateHash(top.text);
  }, 100);

  
  useEffect(() => {
    updateTocScrollbar();
  }, [currIndex, props.headingOffset]);

  const updateTocScrollbar = () => {
    const el = document.querySelector(
      "#toc-container > div > div.markdown-navigation > div.active"
    ) as HTMLElement;

    const container = document.querySelector("#toc-container");
    if (el && container) {
      let to = (el as any)?.offsetTop;
      if (to <= props.headingOffset) {
        to = 0;
      } else {
        to = to - 100;
      }
      scrollTo(container, {
        top: to,
        behavior: "smooth",
      });
    }
    // console.log(el?.offsetTop);
  };

  //TODO 逻辑完善的 hash 更新
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const res = [];
  for (const each of items) {
    const cls = `title-anchor title-level${each.level} ${
      currIndex == each.index ? "active" : ""
    }`;
    res.push(
      <div
        key={each.index}
        className={cls}
        onClick={() => {
          const el: any = getEl(each, items);

          if (el) {
            let to = el.offsetTop - props.headingOffset;
            if (to <= 100) {
              to = 0;
            }
            scrollTo(window, { top: to, easing: "ease-in-out", duration: 800 });

          }
        }}
      >
        {each.text}
      </div>
    );
  }

  return (
    <>
      <div className="relative" style={{ position: "relative" }}>
        {props.mobile ? (
          <>
            <h2
              style={{ fontWeight: 600, fontSize: "1.5em", marginBottom: 4 }}
              className="text-gray-700 dark:text-dark "
            >
              目录
            </h2>
          </>
        ) : (
          <div
            className="text-center text-lg font-medium mt-4 text-gray-700 dark:text-dark cursor-pointer"
            onClick={() => {
              scrollTo(window, {
                top: 0,
                easing: "ease-in-out",
                duration: 800,
              });
            }}
          >
            目录
          </div>
        )}

        <div className="markdown-navigation" style={{ position: "relative" }}>
          {res}
        </div>
        <div style={{ marginBottom: 10, marginTop: -2 }} />
      </div>
    </>
  );
}
