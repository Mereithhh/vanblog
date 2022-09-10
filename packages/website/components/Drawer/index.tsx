import { ReactNode, useMemo, useState } from "react";

export default function (props: {
  children: ReactNode;
  open: boolean;
  setOpen: (o: boolean) => void;
}) {
  const [mask, setMask] = useState(false);
  const show = useMemo(() => {
    if (mask || props.open) {
      return true;
    } else {
      return false;
    }
  }, [mask, props.open]);
  return (
    <>
      <div
        className={"drawer-wrapper"}
        // style={{
        //   visibility: show ? "visible" : "hidden",
        // }}
        // onClick={() => {
        //   props.setOpen(false);
        // }}
      ></div>
      <div
        className={`drawer-content ${props.open ? "enter" : "leave"}`}
        // style={{
        //   display: show ? "flex" : "none",
        // }}
        // onAnimationEnd={(a) => {
        //   if (a.animationName === "moveLeftOut") {
        //     setMask(false);
        //   } else if (a.animationName === "moveLeftIn") {
        //     setMask(true);
        //   }
        // }}
      >
        {props.children}
      </div>
    </>
  );
}
