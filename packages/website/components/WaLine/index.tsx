import "@waline/client/dist/waline.css";
import { useEffect, useRef } from "react";
import { init, commentCount } from "@waline/client";
export default function (props: { serverUrl: string; visible: boolean }) {
  const { current } = useRef<any>({ hasInit: false, wa: null });
  useEffect(() => {
    if (!current.hasInit && props.serverUrl && props.serverUrl != "") {
      current.hasInit = true;
      if (props.visible) {
        current.wa = init({
          el: "#waline",
          serverURL: props.serverUrl,
          comment: true,
          pageview: false,
          dark: ".dark",
        });
      } else {
        current.wa = commentCount({
          serverURL: props.serverUrl,
        });
      }
    }
    return () => {
      if (props.visible) {
        current.wa?.destroy();
      } else {
        current.wa();
      }
    };
  }, [current]);
  if (!props.serverUrl || props.serverUrl == "") {
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
