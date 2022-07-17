import Image from "next/image";
import Link from "next/link";
import Headroom from "headroom.js";
import { useEffect } from "react";
export default function (props: { logo: string; categories: string[] }) {
  useEffect(() => {
    const el = document.querySelector("#nav");
    if (el) {
      const headroom = new Headroom(el);
      headroom.init();
    }
  });
  return (
    <div id="nav" className=" bg-white sticky top-0">
      {/* 上面的导航栏 */}

      <div
        className=" flex  items-center w-full border-b border-gray-200 h-14"
        style={{ height: 56 }}
      >
        <div className="mx-4 flex items-center">
          <Image src={props.logo} width={52} height={52}></Image>
        </div>
        {/* 第二个flex */}
        <div className="flex justify-between h-full flex-grow">
          <ul className=" flex h-full items-center  text-sm text-gray-600">
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
          <div className="flex items-center mx-4 hover:cursor-pointer">
            <Image src="/zoom.svg" width={20} height={20}></Image>
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
  );
}
