import Link from "next/link";
import Headroom from "headroom.js";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import SearchCard, { SearchCardHandle } from "../SearchCard";
import ThemeButton from "../ThemeButton";
import KeyCard from "../KeyCard";
import { MenuItem } from "../../api/getAllData";
import AdminButton from "../AdminButton";
import { ThemeContext } from "../../utils/themeContext";
import RssButton from "../RssButton";
import Item from "./item";
import { encodeQuerystring } from "../../utils/encode";
import {
  HEADER_ACTION_LABELS,
  ICON_ACTION_BUTTON_CLASS,
} from "./a11y";
import { SEARCH_ICON_STROKE_WIDTH } from "../SearchCard/a11y";
import { describeNavLink, withNavCurrentClass } from "./active";
import {
  NAV_BAR_ROW_CLASS,
  NAV_SITE_NAME_DESKTOP,
  NAV_SITE_NAME_DESKTOP_CLASS,
  NAV_SITE_NAME_MOBILE,
  NAV_SITE_NAME_MOBILE_CLASS,
} from "./layout";
export default function (props: {
  logo: string;
  logoDark: string;
  categories: string[];
  setOpen: (open: boolean) => void;
  isOpen: boolean;
  siteName: string;
  menus: MenuItem[];
  showSubMenu: "true" | "false";
  showAdminButton: "true" | "false";
  showFriends: "true" | "false";
  showRSS: "true" | "false";
  headerLeftContent: "siteName" | "siteLogo";
  defaultTheme: "dark" | "auto" | "light";
  subMenuOffset: number;
  openArticleLinksInNewWindow: boolean;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [headroom, setHeadroom] = useState<Headroom>();
  const searchCardRef = useRef<SearchCardHandle>(null);
  const { theme } = useContext(ThemeContext);
  const { asPath } = useRouter();

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

  return (
    <>
      <SearchCard
        ref={searchCardRef}
        openArticleLinksInNewWindow={props.openArticleLinksInNewWindow}
        visible={showSearch}
        setVisible={setShowSearch}
      ></SearchCard>
      <div
        id="nav"
        className=" bg-white sticky top-0 dark:bg-dark nav-shadow dark:nav-shadow-dark"
        style={{ zIndex: 90 }}
      >
        {/* 上面的导航栏 */}
        <div
          className={`${NAV_BAR_ROW_CLASS} flex  items-center w-full border-b border-gray-200 h-14 dark:border-nav-dark`}
          style={{ height: 56 }}
        >
          <div
            data-nav-site-name={NAV_SITE_NAME_MOBILE}
            className={`${NAV_SITE_NAME_MOBILE_CLASS} cursor-pointer select-none dark:text-dark md:hidden`}
          >
            <Link href="/">
              <div>{props.siteName}</div>
            </Link>
          </div>
          <div className="nav-bar-leading mx-4 flex items-center">
            <button
              type="button"
              className={`${ICON_ACTION_BUTTON_CLASS} cursor-pointer block md:hidden`}
              aria-label={HEADER_ACTION_LABELS.menu}
              aria-expanded={props.isOpen}
              aria-controls="nav-mobile"
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
                  className="dark:text-dark fill-gray-600"
                  aria-hidden="true"
                >
                  <path
                    d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zM904 784H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zM904 472H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"
                    p-id="1341"
                  ></path>
                </svg>
              </span>
            </button>
            {props.headerLeftContent == "siteLogo" && (
              <div className="hidden md:block transform translate-x-2">
                <img
                  alt="site logo"
                  src={picUrl}
                  width={52}
                  height={52}
                  className=""
                />
              </div>
            )}
          </div>
          {props.headerLeftContent == "siteName" && (
            <Link href="/">
              <div
                data-nav-site-name={NAV_SITE_NAME_DESKTOP}
                className={`${NAV_SITE_NAME_DESKTOP_CLASS} text-gray-800 cursor-pointer select-none text-lg dark:text-dark lg:text-xl font-medium  mr-4 hidden md:block`}
              >
                {props.siteName}
              </div>
            </Link>
          )}
          {/* 第二个flex */}
          <div className="flex justify-between h-full flex-grow nav-content">
            <ul className=" md:flex h-full items-center  text-sm text-gray-600 dark:text-dark hidden">
              {props.menus.map((m) => {
                return <Item key={m.id} item={m} currentPath={asPath} />;
              })}
            </ul>
            <div className="flex nav-action ml-auto">
              <button
                type="button"
                onClick={() => {
                  searchCardRef.current?.openFromUserGesture();
                }}
                title={HEADER_ACTION_LABELS.search}
                aria-label={HEADER_ACTION_LABELS.search}
                className={`${ICON_ACTION_BUTTON_CLASS} flex group transform hover:scale-110 transition-all select-none cursor-pointer`}
              >
                <div className="flex items-center mr-0 sm:mr-2 hover:cursor-pointer   transition-all dark:text-dark fill-gray-600">
                  <svg
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="2305"
                    width="20"
                    height="20"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth={SEARCH_ICON_STROKE_WIDTH}
                    strokeLinejoin="round"
                    className="dark:text-dark fill-gray-600"
                    aria-hidden="true"
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
              </button>
              <ThemeButton defaultTheme={props.defaultTheme} />
              {props.showRSS == "true" && (
                <RssButton showAdminButton={props.showAdminButton == "true"} />
              )}
              {props.showAdminButton == "true" && <AdminButton />}
            </div>
          </div>
        </div>
        {Boolean(props.categories.length) && props.showSubMenu == "true" && (
          <div className="h-10 items-center hidden md:flex border-b border-gray-200 dark:border-nav-dark overflow-hidden">
            <div
              className="mx-5"
              style={{ width: 52 + props.subMenuOffset }}
            ></div>
            <ul className="flex h-full items-center text-sm text-gray-600 dark:text-dark ">
              {props.categories.map((catelog) => {
                const href = `/category/${encodeQuerystring(catelog)}`;
                const state = describeNavLink(href, asPath);
                return (
                  <li
                    key={catelog}
                    className={withNavCurrentClass(
                      "flex items-center h-full md:px-2 hover:text-gray-900 dark:hover:text-dark-hover transform hover:scale-110 cursor-pointer transition-all ua",
                      state.current
                    )}
                  >
                    <Link href={href} aria-current={state.ariaCurrent}>
                      <div>{catelog}</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
