import { useEffect, useRef } from "react";
import mermaid from "mermaid";
export default function (props: {
  children: any;
  className: string | undefined;
}) {
  const domRef: any = useRef();
  const domIdRef: any = useRef(`mermaid${Date.now()}`);
  let { current: hasInit } = useRef(false);
  useEffect(() => {
    if (!hasInit) {
      hasInit = true;
      try {
        // const mermaid = import()
        // const mermaid = dynamic(() => import("mermaid"));
        mermaid.initialize({ startOnLoad: false });
        mermaid.render(
          domIdRef.current,
          String(props.children),
          (s) => {
            domRef.current.innerHTML = s;
          },
          domRef.current
        );
      } catch (err) {
        console.log("mermaid 渲染失败", err);
      }
    }
  }, [props.children, domRef, domIdRef, hasInit]);

  return (
    <div ref={domRef} className={props.className}>
      <div id={domIdRef.current} className="mermaid"></div>
    </div>
  );
}
