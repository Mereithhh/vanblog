import "../styles/globals.css";
import "../styles/github-markdown.css";
import "../styles/pagination.css";
import "markdown-navbar/dist/navbar.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
