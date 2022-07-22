import Head from "next/head";
import Script from "next/script";
import { useEffect, useRef } from "react";
export default function (props: { id: string }) {
  const { current } = useRef<any>({ hasInit: false });
  useEffect(() => {
    if (!current.hasInit && props.id != "") {
      current.hasInit = true;
      //@ts-ignore
      window.dataLayer = window.dataLayer || [];
      //@ts-ignore
      function gtag() {
        //@ts-ignore
        dataLayer.push(arguments);
      }
      //@ts-ignore
      gtag("js", new Date());
      //@ts-ignore
      gtag("config", props.id);
    }
  }, [current, props]);
  return (
    <>
      <Head>
        {props.id != "" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${props.id}`}
            ></Script>
          </>
        )}
      </Head>
    </>
  );
}
