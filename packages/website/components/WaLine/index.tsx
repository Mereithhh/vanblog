import "@waline/client/dist/waline.css";
import { useEffect, useRef } from "react";
import { init } from "@waline/client";
export default function (props: { serverUrl: string; visible: boolean }) {
  const { current } = useRef<any>({ hasInit: false });
  useEffect(() => {
    if (!current.hasInit && props.serverUrl && props.serverUrl != "") {
      current.hasInit = true;
      init({
        el: "#waline",
        serverURL: props.serverUrl,
        comment: true,
        pageview: true,
        dark: ".dark",
      });
    }
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
