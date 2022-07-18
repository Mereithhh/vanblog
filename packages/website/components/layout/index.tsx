import Head from "next/head";

import { getRunTimeOfDays } from "../../utils/getRunTile";
import BackToTopBtn from "../BackToTop";
import NavBar from "../NavBar";
import Viewer from "../Viewer";
import { slide as Menu } from "react-burger-menu";
import { useState } from "react";
export default function (props: {
  title?: string;
  children: any;
  ipcNumber: string;
  since: Date;
  ipcHref: string;
  logo: string;
  categories: string[];
  sideBar: any;
  favicon: string;
  walineServerUrl: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <NavBar
        logo={props.logo}
        categories={props.categories}
        isOpen={isOpen}
        setOpen={setIsOpen}
      ></NavBar>
      <BackToTopBtn></BackToTopBtn>
      <div>
        <Menu
          customCrossIcon={false}
          customBurgerIcon={false}
          isOpen={isOpen}
          onStateChange={(state) => {
            setIsOpen(state.isOpen);
          }}
        >
          <a id="home" className="menu-item" href="/">
            Home
          </a>
          <a id="about" className="menu-item" href="/about">
            About
          </a>
          <a id="contact" className="menu-item" href="/contact">
            Contact
          </a>
        </Menu>
      </div>
      <div className="container mx-auto  md:px-6  md:py-4 py-2 px-2 text-gray-600 ">
        {props?.title && (
          <Head>
            <title>{props.title}</title>
            <link rel="icon" href={props.favicon}></link>
          </Head>
        )}

        {
          <div className="flex mx-auto justify-center">
            <div className="flex-shrink flex-grow max-w-3xl ">
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
        <footer className="text-center text-sm space-y-1 mt-8 md:mt-12">
          <p className="select-none">
            IPC 编号:{" "}
            <a
              href={props.ipcHref}
              target="_blank"
              className="hover:text-cyan-400 transition"
            >
              {props.ipcNumber}
            </a>
          </p>
          <p className="select-none">
            © {props.since.getFullYear()} - {new Date().getFullYear()}
          </p>
          <p>本站居然运行了 {getRunTimeOfDays(props.since)} 天</p>
          <p className="select-none">
            全站访问量 &nbsp;
            <Viewer></Viewer>
            {/* <span className="waline-pageview-count" data-path="/*" /> */}
          </p>
        </footer>
      </div>
    </>
  );
}
