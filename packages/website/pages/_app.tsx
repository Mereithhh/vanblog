import "../styles/globals.css";
import "markdown-navbar/dist/navbar.css";
import "../styles/side-bar.css";
import "../styles/toc-dark.css";
import "../styles/var.css";
import type { AppProps } from "next/app";
import { GlobalContext, GlobalState } from "../utils/globalContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { addViewer } from "../api/addViewer";

function MyApp({ Component, pageProps }: AppProps) {
  const { current } = useRef({ hasInit: false });
  const [globalState, setGlobalState] = useState<GlobalState>({
    theme: "auto",
    viewer: 0,
    visited: 0,
  });
  const router = useRouter();
  const reloadViewer = async (reason: string) => {
    console.log("[更新访客]", reason);
    const { viewer, visited } = await addViewer();
    setGlobalState({ ...globalState, viewer: viewer, visited: visited });
  };
  useEffect(() => {
    if (!current.hasInit) {
      current.hasInit = true;
      reloadViewer("初始化");
    }
  }, [current]);
  useEffect(() => {
    const handleRouteChange = (
      url: string,
      { shallow }: { shallow: boolean }
    ) => {
      reloadViewer(`页面跳转 ${url}`);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);
  return (
    <GlobalContext.Provider
      value={{ state: globalState, setState: setGlobalState }}
    >
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
}

export default MyApp;
