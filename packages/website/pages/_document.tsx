import { Head, Html, Main, NextScript } from "next/document";
import { THEME_INIT_SCRIPT } from "../utils/theme";

export default function Document() {
  return (
    <Html lang="zh" suppressHydrationWarning>
      <Head>
        <script
          id="vanblog-theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
