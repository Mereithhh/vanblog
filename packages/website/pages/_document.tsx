import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="light" lang="zh">
      <Head>
        <link rel="icon" href="/logo.svg"></link>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
