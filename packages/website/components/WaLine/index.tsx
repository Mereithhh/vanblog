import "@waline/client/dist/waline.css";
import { useEffect, useState } from "react";
import { init } from "@waline/client";
export default function (props: { serverUrl: string }) {
  const [hasInit, setHasInit] = useState(false);
  useEffect(() => {
    if (!hasInit) {
      setHasInit(true);
      init({
        el: "#waline",
        serverURL: props.serverUrl,
      });
    }
  }, [hasInit, setHasInit]);
  return <div id="waline" className="mt-2"></div>;
}
