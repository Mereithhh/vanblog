import Link from "next/link";
import { MouseEventHandler, useMemo, useState } from "react";
import { MenuItem } from "../../api/getAllData";
import { describeNavItem, NavItemState, withNavCurrentClass } from "./active";

function LinkItemAtom(props: {
  item: MenuItem;
  state: NavItemState;
  variant: "underline" | "fill";
  onMouseEnter?: MouseEventHandler<HTMLLIElement>;
  onMouseLeave?: MouseEventHandler<HTMLLIElement>;
  children?: React.ReactNode;
  clsA?: string;
  cls?: string;
}) {
  const { item, state } = props;
  const cls = withNavCurrentClass(
    props.cls
      ? props.cls
      : `nav-item transform hover:scale-110 dark:border-nav-dark  dark:transition-all ua`,
    state.current,
    props.variant
  );
  const clsA = `h-full flex items-center px-2 md:px-4 `;
  if (item.value.includes("http")) {
    return (
      <li
        onMouseEnter={props?.onMouseEnter}
        onMouseLeave={props?.onMouseLeave}
        key={item.id}
        className={cls}
      >
        <a
          className={props.clsA ? props.clsA : clsA}
          href={item.value}
          target="_blank"
        >
          {item.name}
        </a>
        {props?.children}
      </li>
    );
  } else {
    return (
      <li
        onMouseEnter={props?.onMouseEnter}
        onMouseLeave={props?.onMouseLeave}
        key={item.id}
        className={cls}
      >
        <Link
          href={item.value}
          style={{ height: "100%" }}
          aria-current={state.ariaCurrent}
        >
          <div className={props.clsA ? props.clsA : clsA}>{item.name}</div>
        </Link>
      </li>
    );
  }
}

function LinkItemWithChildren(props: {
  item: MenuItem;
  state: NavItemState;
}) {
  const { item, state } = props;
  const [hover, setHover] = useState(false);
  const [hoverSub, setHoverSub] = useState(false);
  const show = useMemo(() => {
    return hover || hoverSub;
  }, [hover, hoverSub]);

  return (
    <>
      <div className="h-full relative">
        <LinkItemAtom
          item={item}
          state={state}
          variant="underline"
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        />

        <div
          className="card-shadow bg-white block transition-all dark:text-dark dark:bg-dark-1 dark:card-shadow-dark"
          style={{
            position: "absolute",
            minWidth: 100,
            top: 50,
            left: "-4px",
            transform: show ? "scale(100%)" : "scale(0)",
            zIndex: 80,
          }}
          onMouseEnter={() => {
            setHoverSub(true);
          }}
          onMouseLeave={() => {
            setHoverSub(false);
          }}
        >
          {item.children?.map((c, index) => {
            const childState =
              state.children?.[index] ?? describeNavItem(c, "", "fill");
            return (
              <LinkItemAtom
                item={c}
                state={childState}
                variant="fill"
                key={c.id}
                clsA={"h-full flex items-center px-2 md:px-4 py-2 "}
                cls={
                  "transition-all cursor-pointer flex items-center h-full hover:bg-gray-300 transition-all dark:hover:bg-dark-2  dark:text-dark dark:hover:text-dark-hover"
                }
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function (props: { item: MenuItem; currentPath: string }) {
  const { item, currentPath } = props;
  const state = describeNavItem(item, currentPath);
  if (!item.children) {
    return <LinkItemAtom item={item} state={state} variant="underline" />;
  } else {
    return <LinkItemWithChildren item={item} state={state} />;
  }
}
