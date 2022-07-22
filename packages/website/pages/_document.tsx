import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="light" lang="zh">
      <Head>
        <script src="/initTheme.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
