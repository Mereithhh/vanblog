import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import ImageBox from "../ImageBox";
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
}) {
  const domRef: any = useRef();
  const domIdRef: any = useRef(`mermaid${Date.now()}`);
  const [svgCode, setSvgCode] = useState("");
  let { current: hasInit } = useRef(false);
  useEffect(() => {
    if (!hasInit) {
      hasInit = true;
      try {
        mermaid.initialize({ startOnLoad: false });
        mermaid.render(
          domIdRef.current,
          String(props.children),
          (s) => {
            setSvgCode(s);
          },
          domRef.current
        );
      } catch (err) {
        console.log("mermaid 渲染失败，可能是没正确插入 more 标记导致的。");
      }
    }
  }, [props.children, domRef, domIdRef, hasInit, setSvgCode]);

  return (
    <div className={props.className}>
      {svgCode != "" && (
        <ImageBox
          src={encodeSvg(svgCode)}
          alt="mermaid 图片"
          lazyLoad={true}
        ></ImageBox>
      )}

      <div ref={domRef}>
        <div id={domIdRef.current} className="mermaid"></div>
      </div>
    </div>
  );
}
