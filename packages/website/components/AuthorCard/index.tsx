import Link from "next/link";
import { useContext, useEffect, useMemo } from "react";
import Headroom from "headroom.js";
import { SocialItem } from "../../api/getAllData";
import SocialCard from "../SocialCard";
import { ThemeContext } from "../../utils/themeContext";
import ImageBox from "../ImageBox";
export interface AuthorCardProps {
  author: string;
  desc: string;
  logo: string;
  logoDark: string;
  postNum: number;
  catelogNum: number;
  tagNum: number;
  enableComment?: "true" | "false";
  socials: SocialItem[];
  showSubMenu: "true" | "false";
  showRSS: "true" | "false";
}

export default function (props: { option: AuthorCardProps }) {
  const { theme } = useContext(ThemeContext);

  const logoUrl = useMemo(() => {
    if (
      theme.includes("dark") &&
      props.option.logoDark &&
      props.option.logoDark != ""
    ) {
      return props.option.logoDark;
    }
    return props.option.logo;
  }, [theme, props]);
  useEffect(() => {
    const el = document.querySelector("#author-card");
    if (el) {
      const headroom = new Headroom(el, {
        classes: {
          initial: `side-bar${props.option.showSubMenu == "true" ? "" : " no-submenu"
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
    <div id="author-card" className="sticky ">
      <div className="w-52 flex flex-col justify-center items-center bg-white pt-6  pb-4 card-shadow ml-2 dark:bg-dark dark:card-shadow-dark">
        <div className="px-10 flex flex-col justify-center items-center">
          <ImageBox
            alt="author logo"
            className="rounded-full  dark:filter-dark"
            src={logoUrl}
            width={120}
            height={120}
            lazyLoad={false}
          />

          <div className="mt-2 font-semibold text-gray-600 mb-2 dark:text-dark">
            {props.option.author}
          </div>
          <div className="text-sm text-gray-500 mb-2 dark:text-dark-light">
            {props.option.desc}
          </div>
          <div className="flex">
            <Link href="/timeline">
              <div className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1 dark:text-dark ">
                <div className="group-hover:text-gray-900 font-bold group-hover:font-black dark:group-hover:text-dark-hover">
                  {props.option.postNum}
                </div>
                <div className="group-hover:text-gray-900 group-hover:font-normal text-gray-500 dark:text-dark-light dark:group-hover:text-dark-hover">
                  日志
                </div>
              </div>
            </Link>
            <Link href="/category">
              <div className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1 dark:text-dark">
                <div className="group-hover:text-gray-900 font-bold group-hover:font-black dark:group-hover:text-dark-hover">
                  {props.option.catelogNum}
                </div>
                <div className="group-hover:text-gray-900 group-hover:font-normal text-gray-500 dark:text-dark-light dark:group-hover:text-dark-hover">
                  分类
                </div>
              </div>
            </Link>
            <Link href="/tag">
              <div className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1 dark:text-dark">
                <div className="group-hover:text-gray-900 font-bold group-hover:font-black dark:group-hover:text-dark-hover">
                  {props.option.tagNum}
                </div>
                <div className=" group-hover:text-gray-900 group-hover:font-normal text-gray-500 dark:text-dark-light dark:group-hover:text-dark-hover">
                  标签
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-4 w-full">
          <SocialCard socials={props.option.socials}></SocialCard>
        </div>
        {/* {props.option.showRSS == "true" && (
          <div className="mt-3 w-full flex justify-center">
            <a
              href={`/feed.xml`}
              rel="noreferrer"
              target="_blank"
              className="flex text-gray-500 px-2 py-1 dark:text-dark select-none cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-light dark:hover:text-dark-r rounded-sm transition-all text-xs"
            >
              <RssLogo size={18} />
              <span className="ml-1 text-sm">RSS</span>
            </a>
          </div>
        )} */}
      </div>
    </div>
  );
}
