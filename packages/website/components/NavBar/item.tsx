import Link from "next/link";
import { MouseEventHandler, useMemo, useRef, useState } from "react";
import { MenuItem } from "../../api/getAllData";

function LinkItemAtom(props: {
  item: MenuItem;
  onMouseEnter?: MouseEventHandler<HTMLLIElement>;
  onMouseLeave?: MouseEventHandler<HTMLLIElement>;
  children?: React.ReactNode;
  clsA?: string;
  cls?: string;
}) {
  const { item } = props;
  const cls = `nav-item transform hover:scale-110 dark:border-nav-dark  dark:transition-all ua`;
  const clsA = `h-full flex items-center px-2 md:px-4 `;
  if (item.value.includes("http")) {
    return (
      <li
        onMouseEnter={props?.onMouseEnter}
        onMouseLeave={props?.onMouseLeave}
        key={item.id}
        className={props.cls ? props.cls : cls}
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
        className={props.cls ? props.cls : cls}
      >
        <Link href={item.value} style={{ height: "100%" }}>
          <div className={props.clsA ? props.clsA : clsA}>{item.name}</div>
        </Link>
      </li>
    );
  }
}

function LinkItemWithChildren(props: { item: MenuItem }) {
  const { item } = props;
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
          {item.children?.map((c) => {
            return (
              <LinkItemAtom
                item={c}
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

export default function (props: { item: MenuItem }) {
  const { item } = props;
  if (!item.children) {
    return <LinkItemAtom item={item} />;
  } else {
    return <LinkItemWithChildren item={item} />;
  }
}
