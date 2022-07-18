import Image from "next/image";
import Link from "next/link";
import Headroom from "headroom.js";
import { useEffect, useState } from "react";
import SearchCard from "../SearchCard";
import ThemeButton from "../ThemeButton";
export default function (props: {
  logo: string;
  categories: string[];
  setOpen: (open: boolean) => void;
  isOpen: boolean;
  siteName: string;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [headroom, setHeadroom] = useState<Headroom>();
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
  return (
    <>
      <SearchCard visible={showSearch} setVisible={setShowSearch}></SearchCard>
      <div
        id="nav"
        className=" bg-white sticky top-0"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15);", zIndex: 9999 }}
      >
        {/* 上面的导航栏 */}
        <div
          className=" flex  items-center w-full border-b border-gray-200 h-14"
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
                >
                  <path
                    d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zM904 784H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zM904 472H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"
                    p-id="1341"
                  ></path>
                </svg>
              </span>
            </div>
            <Image
              src={props.logo}
              width={52}
              height={52}
              className="invisible sm:visible"
            ></Image>
          </div>
          {/* 第二个flex */}
          <div className="flex justify-between h-full flex-grow ">
            <div className=" sm:hidden flex-grow text-center  flex items-center justify-center select-none">
              <div>{props.siteName}</div>
            </div>
            <ul className=" sm:flex h-full items-center  text-sm text-gray-600 hidden">
              <li className="nav-item ">
                <Link href={"/"}>
                  <a>首页</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/tag"}>
                  <a>标签</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/category"}>
                  <a>分类</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/timeline"}>
                  <a>时间线</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"https://tools.mereith.com"} target="_blank">
                  <a>工具站</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href={"/about"}>
                  <a>关于</a>
                </Link>
              </li>
            </ul>
            <div className="flex">
              <div
                onClick={() => {
                  setShowSearch(true);
                  document.body.style.overflow = "hidden";
                }}
                className="flex items-center mx-4 hover:cursor-pointer hover:scale-125 transform transition-all"
              >
                <Image src="/zoom.svg" width={20} height={20}></Image>
              </div>
              <ThemeButton />
            </div>
          </div>
        </div>

        <div className="h-10 items-center hidden md:flex border-b border-gray-200">
          <div className="mx-5" style={{ width: 52 }}></div>
          <ul className="flex h-full items-center text-sm text-gray-600">
            {props.categories.map((catelog) => {
              return (
                <li
                  key={catelog}
                  className="flex items-center h-full md:px-2 hover:text-cyan-400 cursor-pointer transition"
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
