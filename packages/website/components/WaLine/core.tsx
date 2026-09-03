import "@waline/client/dist/waline.css";
import { useEffect, useRef } from "react";
import { init, commentCount } from "@waline/client";
import {
  buildWalineInitOptions,
  WalineCommentSetting,
} from "../../utils/walineClient";

async function loadCommentSetting(): Promise<WalineCommentSetting> {
  try {
    const res = await fetch("/api/public/comment-setting");
    const json = await res.json();
    return json?.data ?? {};
  } catch {
    // Keep Waline default when the setting endpoint is unavailable.
  }
  return {};
}

export default function (props: {
  enable: "true" | "false";
  visible: boolean;
}) {
  const { current } = useRef<any>({ hasInit: false, wa: null });
  useEffect(() => {
    let cancelled = false;
    const state = current;
    if (!state.hasInit && props.enable && props.enable == "true") {
      state.hasInit = true;
      const setup = async () => {
        if (props.visible) {
          const setting = await loadCommentSetting();
          if (cancelled) {
            return;
          }
          const extra = buildWalineInitOptions(setting);
          state.wa = init({
            el: "#waline",
            serverURL: `${window.location.protocol}//${window.location.host}`,
            comment: true,
            pageview: false,
            dark: ".dark",
            lang: "zh",
            ...extra,
          });
        } else {
          state.wa = commentCount({
            serverURL: `${window.location.protocol}//${window.location.host}`,
          });
        }
      };
      setup();
    }
    return () => {
      cancelled = true;
      if (props.enable && props.enable == "true") {
        if (props.visible) {
          state.wa?.destroy();
        } else if (typeof state.wa === "function") {
          state.wa();
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
