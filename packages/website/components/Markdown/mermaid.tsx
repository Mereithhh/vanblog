import { useCallback, useContext, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { ThemeContext } from "../../utils/themeContext";

export default function Mermaid(props: {
  children: any;
  className: string | undefined;
  id: any;
}) {
  const domRef: any = useRef();
  const domIdRef: any = useRef(`mermaid${props.id}`);
  const { theme } = useContext(ThemeContext);
  const render = useCallback(() => {
    try {
      mermaid.initialize({
        securityLevel: "loose",
        startOnLoad: false,
        theme: theme.includes("dark") ? "dark" : ("default" as any),
      });
      mermaid.run({
        querySelector: ".mermaid"
      });
    } catch (err) {
      // console.log(err);
      // console.log("mermaid 渲染失败，可能是没正确插入 more 标记导致的。");
    }
  }, [theme]);

  useEffect(() => {
    render();
  }, []);

  return (
    <div className={props.className}>
      <div ref={domRef}>
        <div id={domIdRef.current} className="mermaid">{props.children}</div>
      </div>
    </div >
  );
}
