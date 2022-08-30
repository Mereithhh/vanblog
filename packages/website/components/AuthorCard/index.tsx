import Link from "next/link";
import { useContext, useEffect, useMemo } from "react";
import Headroom from "headroom.js";
import { SocialItem } from "../../api/getAllData";
import SocialCard from "../SocialCard";
import ImageBoxFuture from "../ImageBoxFuture";
import { ThemeContext } from "../../utils/themeContext";
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
          initial: `side-bar${
            props.option.showSubMenu == "true" ? "" : " no-submenu"
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
    <div id="author-card" className="fixed ">
      <div className="w-52 flex flex-col justify-center items-center bg-white pt-6  pb-4 card-shadow ml-2 dark:bg-dark dark:card-shadow-dark">
        <div className="px-10 flex flex-col justify-center items-center">
          <ImageBoxFuture
            alt="author logo"
            className="rounded-full hover:rotate-180 duration-500 transition-all dark:filter-dark"
            src={logoUrl}
            width={120}
            height={120}
          />

          <div className="mt-2 font-semibold text-gray-600 mb-2 dark:text-dark">
            {props.option.author}
          </div>
          <div className="text-sm text-gray-500 mb-2 dark:text-dark-light">
            {props.option.desc}
          </div>
          <div className="flex">
            <Link href="/timeline">
              <a className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1 dark:text-dark ">
                <div className="group-hover:text-gray-900 font-bold group-hover:font-black dark:group-hover:text-dark-hover">
                  {props.option.postNum}
                </div>
                <div className="group-hover:text-gray-900 group-hover:font-normal text-gray-500 dark:text-dark-light dark:group-hover:text-dark-hover">
                  日志
                </div>
              </a>
            </Link>
            <Link href="/category">
              <a className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1 dark:text-dark">
                <div className="group-hover:text-gray-900 font-bold group-hover:font-black dark:group-hover:text-dark-hover">
                  {props.option.catelogNum}
                </div>
                <div className="group-hover:text-gray-900 group-hover:font-normal text-gray-500 dark:text-dark-light dark:group-hover:text-dark-hover">
                  分类
                </div>
              </a>
            </Link>
            <Link href="/tag">
              <a className="group flex flex-col justify-center items-center text-gray-600 text-sm px-1 dark:text-dark">
                <div className="group-hover:text-gray-900 font-bold group-hover:font-black dark:group-hover:text-dark-hover">
                  {props.option.tagNum}
                </div>
                <div className=" group-hover:text-gray-900 group-hover:font-normal text-gray-500 dark:text-dark-light dark:group-hover:text-dark-hover">
                  标签
                </div>
              </a>
            </Link>
          </div>
        </div>

        <div className="mt-4 w-full">
          <SocialCard socials={props.option.socials}></SocialCard>
        </div>
      </div>
    </div>
  );
}
