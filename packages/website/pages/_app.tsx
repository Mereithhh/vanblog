import "../styles/globals.css";
import "markdown-navbar/dist/navbar.css";
import "../styles/side-bar.css";
import "../styles/toc-dark.css";
import "../styles/var.css";
import type { AppProps } from "next/app";
import { GlobalContext } from "../utils/globalContext";
import { useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState("auto");
  return (
    <GlobalContext.Provider value={{ theme: theme, setTheme }}>
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
}

export default MyApp;
