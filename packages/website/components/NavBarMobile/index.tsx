import { slide as Menu } from "react-burger-menu";
import Link from "next/link";
import { useCallback } from "react";
import { MenuItem } from "../../api/getAllData";
export default function (props: {
  isOpen: boolean;
  setIsOpen: (i: boolean) => void;
  showFriends: "true" | "false"
  showAdminButton: "true" | "false"
  links: MenuItem[];
}) {
  const renderLinks = useCallback(() => {
    const arr: any[] = [];
    props.links.forEach((item) => {
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
      <div>
        <Menu
          id="nav-mobile"
          disableAutoFocus={true}
          customCrossIcon={false}
          customBurgerIcon={false}
          isOpen={props.isOpen}
          onStateChange={(state) => {
            if (state.isOpen) {
              // 要打开
              document.body.style.overflow = "hidden";
            } else {
              document.body.style.overflow = "auto";
            }

            props.setIsOpen(state.isOpen);
          }}
        >
          <ul
            onClick={() => {
              document.body.style.overflow = "auto";
              props.setIsOpen(false);
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
            {props.showFriends == "true" && (
              <li className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2">
                <Link href={"/link"}>
                  <a className="w-full inline-block px-4 ">友链</a>
                </Link>
              </li>
            )}
            {props.showAdminButton == "true" && (
              <li
                className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2"
                key={"rss-phone-nav-btn"}
              >
                <a
                  className="w-full inline-block px-4 "
                  target="_blank"
                  href={"/admin"}
                >
                  {"后台"}
                </a>
              </li>
            )}
            <li className="side-bar-item dark:border-dark-2 dark:hover:bg-dark-2">
              <Link href={"/about"}>
                <a className="w-full inline-block px-4 ">关于</a>
              </Link>
            </li>
            {renderLinks()}
          </ul>
        </Menu>
      </div>
    </>
  );
}
