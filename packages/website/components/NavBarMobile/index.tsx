import { slide as Menu } from "react-burger-menu";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { MenuItem } from "../../api/getAllData";
import { describeNavItem, describeNavMenu, withNavCurrentClass } from "../NavBar/active";
export default function (props: {
  isOpen: boolean;
  setIsOpen: (i: boolean) => void;
  showFriends: "true" | "false";
  showAdminButton: "true" | "false";
  menus: MenuItem[];
}) {
  const { asPath } = useRouter();
  const renderItem = useCallback(
    (item: MenuItem, state: ReturnType<typeof describeNavItem>, isSub?: boolean) => {
      const cls = withNavCurrentClass(
        "side-bar-item dark:border-dark-2 dark:hover:bg-dark-2",
        state.current,
        "sidebar"
      );
      if (item.value.includes("http")) {
        return (
          <li className={cls} key={item.id}>
            <a
              className={`w-full inline-block  ${isSub ? "px-6" : "px-4"}`}
              target="_blank"
              href={item.value}
            >
              {item.name}
            </a>
          </li>
        );
      } else {
        return (
          <li className={cls} key={item.id}>
            <Link href={item.value} aria-current={state.ariaCurrent}>
              <div className={`w-full inline-block  ${isSub ? "px-8" : "px-4"}`}>
                {item.name}
              </div>
            </Link>
          </li>
        );
      }
    },
    []
  );
  const renderLinks = useCallback(() => {
    const arr: any[] = [];
    const states = describeNavMenu(props.menus, asPath, "sidebar");
    props.menus.forEach((item, index) => {
      const state = states[index];
      arr.push(renderItem(item, state));
      if (item.children && item.children.length > 0) {
        item.children.forEach((i, childIndex) => {
          arr.push(
            renderItem(
              i,
              state.children?.[childIndex] ??
                describeNavItem(i, asPath, "sidebar"),
              true
            )
          );
        });
      }
    });
    return arr;
  }, [props, asPath, renderItem]);
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
            {renderLinks()}
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
          </ul>
        </Menu>
      </div>
    </>
  );
}
