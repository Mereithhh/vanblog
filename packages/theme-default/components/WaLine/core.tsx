import "@waline/client/dist/waline.css";
import { useEffect, useRef } from "react";
import { init, commentCount } from "@waline/client";
export default function (props: {
  enable: "true" | "false";
  visible: boolean;
}) {
  const { current } = useRef<any>({ hasInit: false, wa: null });
  useEffect(() => {
    if (!current.hasInit && props.enable && props.enable == "true") {
      current.hasInit = true;
      if (props.visible) {
        current.wa = init({
          el: "#waline",
          serverURL: `${window.location.protocol}//${window.location.host}`,
          comment: true,
          pageview: false,
          dark: ".dark",
          lang: "zh",
        });
      } else {
        current.wa = commentCount({
          serverURL: `${window.location.protocol}//${window.location.host}`,
        });
      }
    }
    return () => {
      if (props.enable && props.enable == "true") {
        if (props.visible) {
          current.wa?.destroy();
        } else {
          current?.wa();
        }
      }
    };
  }, [current, props]);
  if (!props.enable || props.enable == "false") {
    return null;
  }
  return (
    <div
      id="waline"
      className="mt-2"
      style={{
        display: props.visible ? "block" : "none",
      }}
    ></div>
  );
}
