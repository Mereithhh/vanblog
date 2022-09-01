import { Head, Html, Main, NextScript } from "next/document";
import { decodeTheme, initTheme } from "../utils/theme";

export default function Document() {
  return (
    <Html className={decodeTheme(initTheme()).replace("auto-", "")} lang="zh">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
