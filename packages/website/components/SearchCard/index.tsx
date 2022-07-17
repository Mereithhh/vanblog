import { useRef } from "react";

export default function (props: {
  visible: boolean;
  setVisible: (v: boolean) => void;
}) {
  const innerRef = useRef(null);
  return (
    <div
      className="fixed w-full h-full top-0 left-0 right-0 bottom-0  justify-center items-center flex"
      style={{
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.4)",
        visibility: props.visible ? "visible" : "hidden",
        // display: props.visible ? "flex" : "none",
        // transform: props.visible ? "scale(100%)" : "scale(0)",
      }}
      onClick={(ev) => {
        if (innerRef.current) {
          if (!(innerRef.current as any).contains(ev.target as any)) {
            // 在内
            props.setVisible(false);
          }
        }
      }}
    >
      <div
        ref={innerRef}
        className="bg-white w-2/3  p-4 rounded-xl shadow-lg transition-all"
        style={{
          minHeight: "280px",
          minWidth: 400,
          maxWidth: "710px",
          transform: props.visible
            ? "translateY(-30%) scale(100%)"
            : "translateY(-30%) scale(0)",
        }}
      >
        sdf
      </div>
    </div>
  );
}
