import Head from "next/head";
import { decode } from "js-base64";
import Script from "next/script";
export default function (props: {
  customCss?: string;
  customHtml?: string;
  customScript?: string;
}) {
  return (
    <>
      <Head>
        {Boolean(props?.customCss) && (
          <style>{decode(props.customCss as string)}</style>
        )}
      </Head>
      {Boolean(props?.customHtml) && (
        <div
          dangerouslySetInnerHTML={{
            __html: decode(props.customHtml as string),
          }}
        ></div>
      )}
      {Boolean(props?.customScript) && (
        <Script strategy="beforeInteractive">{`${decode(
          props.customScript as string
        )}`}</Script>
      )}
    </>
  );
}
