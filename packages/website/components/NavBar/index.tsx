import Link from "next/link";
import Headroom from "headroom.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import SearchCard from "../SearchCard";
import ThemeButton from "../ThemeButton";
import KeyCard from "../KeyCard";
import { GlobalContext } from "../../utils/globalContext";
import { MenuItem } from "../../api/getAllData";
import Image from "next/future/image";
export default function (props: {
  logo: string;
  logoDark: string;
  categories: string[];
  setOpen: (open: boolean) => void;
  isOpen: boolean;
  siteName: string;
  links: MenuItem[];
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [headroom, setHeadroom] = useState<Headroom>();
  const { state } = useContext(GlobalContext);
  const { theme } = state;
  const picUrl = useMemo(() => {
    if (theme.includes("dark") && props.logoDark && props.logoDark != "") {
      return props.logoDark;
    }
    return props.logo;
  }, [theme, props]);
  useEffect(() => {
    const el = document.querySelector("#nav");
    if (el && !headroom) {
      const headroom = new Headroom(el);
      headroom.init();
      setHeadroom(headroom);
    }
    return () => {
      headroom?.destroy();
    };
  }, [headroom, setHeadroom]);

  const renderedLinks = useCallback(() => {
    const arr: any[] = [];
    props.links.forEach((item) => {
      arr.push(
        <li
          key={item.name}
          className="nav-item transform hover:scale-110 dark:border-nav-dark  dark:transition-all"
        >
          <a
            className="h-full flex items-center px-2 md:px-4 ua"
            href={item.value}
            target="_blank"
          >
            {item.name}
          </a>
        </li>
      );
    });
    return arr;
  }, [props]);
  return (
    <>
      <SearchCard visible={showSearch} setVisible={setShowSearch}></SearchCard>
      <div
        id="nav"
        className=" bg-white sticky top-0 dark:bg-dark nav-shadow dark:nav-shadow-dark"
        style={{ zIndex: 1200 }}
      >
        {/* 上面的导航栏 */}
        <div
          className=" flex  items-center w-full border-b border-gray-200 h-14 dark:border-nav-dark"
          style={{ height: 56 }}
        >
          <div className="mx-4 flex items-center">
            <div
              className="cursor-pointer block sm:hidden"
              onClick={() => {
                if (!props.isOpen) {
                  // 要打开
                  headroom?.pin();
                }
                props.setOpen(!props.isOpen);
              }}
            >
              <span>
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1340"
                  width="24"
                  height="24"
                  className="dark:text-dark"
                >
                  <path
                    d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zM904 784H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zM904 472H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"
                    p-id="1341"
                  ></path>
                </svg>
              </span>
            </div>
            <div className="hidden sm:block transform translate-x-2">
              <Image
                alt="site logo"
                src={picUrl}
                width={52}
                height={52}
              ></Image>
            </div>
          </div>
          {/* 第二个flex */}
          <div className="flex justify-between h-full flex-grow ">
            <div className=" sm:hidden flex-grow text-center  flex items-center justify-center select-none dark:text-dark">
              <div>{props.siteName}</div>
            </div>
            <ul className=" sm:flex h-full items-center  text-sm text-gray-600 dark:text-dark hidden">
              <li className="nav-item transform hover:scale-110  dark:border-nav-dark dark:transition-all">
                <Link href={"/"}>
                  <a className="h-full flex items-center px-2 md:px-4 ua ">
                    首页
                  </a>
                </Link>
              </li>
              <li className="nav-item transform hover:scale-110  dark:border-nav-dark  dark:transition-all">
                <Link href={"/tag"}>
                  <a className="h-full flex items-center px-2 md:px-4 ua">
                    标签
                  </a>
                </Link>
              </li>
              <li className="nav-item transform hover:scale-110  dark:border-nav-dark  dark:transition-all">
                <Link href={"/category"}>
                  <a className="h-full flex items-center px-2 md:px-4 ua">
                    分类
                  </a>
                </Link>
              </li>
              <li className="nav-item transform hover:scale-110  dark:border-nav-dark  dark:transition-all">
                <Link href={"/timeline"}>
                  <a className="h-full flex items-center px-2 md:px-4 ua">
                    时间线
                  </a>
                </Link>
              </li>
              {renderedLinks()}
              <li className="nav-item transform hover:scale-110  dark:border-nav-dark  dark:transition-all">
                <Link href={"/about"}>
                  <a className="h-full flex items-center px-2 md:px-4 ua">
                    关于
                  </a>
                </Link>
              </li>
            </ul>
            <div className="flex">
              <div
                onClick={() => {
                  setShowSearch(true);
                  document.body.style.overflow = "hidden";
                }}
                className="flex group transform hover:scale-110 transition-all select-none cursor-pointer"
              >
                <div className="flex items-center mr-0 sm:mr-2 hover:cursor-pointer   transition-all dark:text-dark fill-gray-600">
                  <svg
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="2305"
                    width="20"
                    height="20"
                  >
                    <path
                      d="M789.804097 737.772047 742.865042 784.699846 898.765741 940.600545 945.704796 893.672746Z"
                      p-id="2306"
                    ></path>
                    <path
                      d="M456.92259 82.893942c-209.311143 0-379.582131 170.282245-379.582131 379.582131s170.270988 379.570875 379.582131 379.570875c209.287607 0 379.558595-170.270988 379.558595-379.570875S666.210197 82.893942 456.92259 82.893942zM770.128989 462.477097c0 172.721807-140.508127 313.229934-313.206398 313.229934-172.720783 0-313.229934-140.508127-313.229934-313.229934s140.508127-313.229934 313.229934-313.229934C629.620861 149.247162 770.128989 289.75529 770.128989 462.477097z"
                      p-id="2307"
                    ></path>
                  </svg>
                </div>
                <div className="flex items-center ">
                  <KeyCard type="search"></KeyCard>
                </div>
              </div>

              <ThemeButton />
            </div>
          </div>
        </div>

        <div className="h-10 items-center hidden md:flex border-b border-gray-200 dark:border-nav-dark">
          <div className="mx-5" style={{ width: 52 }}></div>
          <ul className="flex h-full items-center text-sm text-gray-600 dark:text-dark ">
            {props.categories.map((catelog) => {
              return (
                <li
                  key={catelog}
                  className="flex items-center h-full md:px-2 hover:text-gray-900 dark:hover:text-dark-hover transform hover:scale-110 cursor-pointer transition-all"
                >
                  <Link href={`/category/${catelog}`}>
                    <a>{catelog}</a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
