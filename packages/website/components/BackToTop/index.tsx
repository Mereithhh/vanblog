import React, { useEffect, useState } from "react";
import style from "../../styles/back-to-top.module.css";
import scroll from "react-scroll";
import Image from "next/image";
import { debounce } from "../../utils/debounce";
interface BackToTopBtnProps {}
function getScrollTop() {
  var scrollTop = 0,
    bodyScrollTop = 0,
    documentScrollTop = 0;
  if (document.body) {
    bodyScrollTop = document.body.scrollTop;
  }
  if (document.documentElement) {
    documentScrollTop = document.documentElement.scrollTop;
  }
  scrollTop =
    bodyScrollTop - documentScrollTop > 0 ? bodyScrollTop : documentScrollTop;
  return scrollTop;
}
const BackToTopBtn: React.FC<BackToTopBtnProps> = (props) => {
  const [visibleBackTopBtn, setVisibleBackTopBtn] = useState(false);

  useEffect(() => {
    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [visibleBackTopBtn]);

  const handleScroll = debounce((ev: any) => {
    const scrollTop = getScrollTop();
    // scrollHeight为整个文档高度
    if (scrollTop > 300) {
      setVisibleBackTopBtn(true);
    } else {
      setVisibleBackTopBtn(false);
    }
  }, 100);

  const backToTopHandle = () => {
    scroll.animateScroll.scrollToTop();
  };

  return (
    <>
      {visibleBackTopBtn && (
        <div
          onClick={backToTopHandle}
          className={`${style.backToTop}  rounded-xl transform  transition-all hover:scale-110`}
        >
          <Image
            className="transform  transition-all hover:scale-110"
            src="/rocket.svg"
            width={24}
            height={24}
          ></Image>
        </div>
      )}
    </>
  );
};

export default BackToTopBtn;
