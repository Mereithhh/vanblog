import Head from "next/head";

import BackToTopBtn from "../BackToTop";
import NavBar from "../NavBar";
import Viewer from "../Viewer";
import { slide as Menu } from "react-burger-menu";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BaiduAnalysis from "../baiduAnalysis";
import GaAnalysis from "../gaAnalysis";
import { LayoutProps } from "../../utils/getLayoutProps";
import RunningTime from "../RunningTime";
export default function (props: {
  option: LayoutProps;
  title: string;
  sideBar: any;
  children: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  });
  const renderLinks = useCallback(() => {
    const arr: any[] = [];
    props.option.links.forEach((item) => {
      arr.push(
        <li
          className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2"
          key={item.name}
        >
          <a
            className="w-full inline-block px-4 "
            target="_blank"
            href={item.value}
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
      {props.option.baiduAnalysisID != "" &&
        process.env.NODE_ENV != "development" && (
          <BaiduAnalysis id={props.option.baiduAnalysisID}></BaiduAnalysis>
        )}
      {props.option.gaAnalysisID != "" &&
        process.env.NODE_ENV != "development" && (
          <GaAnalysis id={props.option.gaAnalysisID}></GaAnalysis>
        )}

      <NavBar
        showSubMenu={props.option.showSubMenu}
        links={props.option.links}
        siteName={props.option.siteName}
        logo={props.option.logo}
        categories={props.option.categories}
        isOpen={isOpen}
        setOpen={setIsOpen}
        logoDark={props.option.logoDark}
      ></NavBar>
      <BackToTopBtn></BackToTopBtn>
      <div>
        <Menu
          disableAutoFocus={true}
          customCrossIcon={false}
          customBurgerIcon={false}
          isOpen={isOpen}
          onStateChange={(state) => {
            if (state.isOpen) {
              // 要打开
              document.body.style.overflow = "hidden";
            } else {
              document.body.style.overflow = "auto";
            }

            setIsOpen(state.isOpen);
          }}
        >
          <ul
            onClick={() => {
              document.body.style.overflow = "auto";
              setIsOpen(false);
            }}
            className=" sm:flex h-full items-center  text-sm text-gray-600 hidden divide-y divide-dashed dark:text-dark "
          >
            <li className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2">
              <Link href={"/"}>
                <a className="w-full inline-block px-4 ">主页</a>
              </Link>
            </li>
            <li className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2">
              <Link href={"/tag"}>
                <a className="w-full inline-block px-4 ">标签</a>
              </Link>
            </li>
            <li className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2">
              <Link href={"/category"}>
                <a className="w-full inline-block px-4 ">分类</a>
              </Link>
            </li>
            <li className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2">
              <Link href={"/timeline"}>
                <a className="w-full inline-block px-4 ">时间线</a>
              </Link>
            </li>
            {renderLinks()}
            <li className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2">
              <Link href={"/about"}>
                <a className="w-full inline-block px-4 ">关于</a>
              </Link>
            </li>
          </ul>
        </Menu>
      </div>
      <div className=" mx-auto  lg:px-6  md:py-4 py-2 px-2 md:px-4  text-gray-700 ">
        <Head>
          <title>{props.title}</title>
          <link rel="icon" href={props.option.favicon}></link>
          <meta name="description" content={props.option.description}></meta>
        </Head>

        {
          <div className="flex mx-auto justify-center">
            <div className="flex-shrink flex-grow md:max-w-3xl xl:max-w-4xl">
              {props.children}
            </div>
            <div
              className={`hidden lg:block flex-shrink-0 flex-grow-0 ${
                Boolean(props.sideBar) ? "w-52" : ""
              }`}
            >
              {props.sideBar}
            </div>
          </div>
        }
        <footer className="text-center text-sm space-y-1 mt-8 md:mt-12 dark:text-dark">
          {Boolean(props.option.ipcNumber) && props.option.ipcNumber != "" && (
            <p className="">
              IPC 编号:{" "}
              <a
                href={props.option.ipcHref}
                target="_blank"
                className="hover:text-gray-900 hover:underline-offset-2 hover:underline dark:hover:text-dark-hover transition"
              >
                {props.option.ipcNumber}
              </a>
            </p>
          )}
          <RunningTime since={props.option.since}></RunningTime>
          <p className="">
            Powered By{" "}
            <a
              href="https://vanblog.mereith.com"
              target={"_blank"}
              className="hover:text-gray-900 hover:underline-offset-2 hover:underline dark:hover:text-dark-hover transition"
            >
              Van Blog
            </a>
          </p>

          <p className="select-none">
            © {new Date(props.option.since).getFullYear()} -{" "}
            {new Date().getFullYear()}
          </p>
          <p className="select-none">
            <Viewer></Viewer>
          </p>
        </footer>
      </div>
    </>
  );
}
