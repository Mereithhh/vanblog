import { useCallback, useContext, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { GlobalContext } from "../../utils/globalContext";

const encodeSvg = (s: string) => {
  return (
    "data:image/svg+xml," +
    s
      .replace(/"/g, "'")
      .replace(/%/g, "%25")
      .replace(/#/g, "%23")
      .replace(/{/g, "%7B")
      .replace(/}/g, "%7D")
      .replace(/</g, "%3C")
      .replace(/>/g, "%3E")
      .replace(`style='`, `style='background-color: white; `)
  );
};
export default function (props: {
  children: any;
  className: string | undefined;
  id: any;
}) {
  const domRef: any = useRef();
  const domIdRef: any = useRef(`mermaid${props.id}`);
  let { current } = useRef({ hasInit: false });
  const { state } = useContext(GlobalContext);
  const { theme } = state;
  const render = useCallback(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme.includes("dark") ? "dark" : ("default" as any),
      });
      mermaid.render(
        domIdRef.current,
        String(props.children),
        (s) => {
          domRef.current.innerHTML = s;
        },
        domRef.current
      );
    } catch (err) {
      // console.log(err);
      // console.log("mermaid 渲染失败，可能是没正确插入 more 标记导致的。");
    }
  }, []);

  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      setTimeout(() => {
        render();
      }, 200);
    }
  }, [current, render]);

  return (
    <div className={props.className}>
      <div ref={domRef}>
        <div id={domIdRef.current} className="mermaid"></div>
      </div>
    </div>
  );
}
