import Head from "next/head";
import { decode } from "js-base64";
import Script from "next/script";
import { HeadTag } from "../../utils/getLayoutProps";
import { createElement } from "react";
export default function (props: {
  customCss?: string;
  customHtml?: string;
  customScript?: string;
  customHead?: HeadTag[];
}) {
  const renderHeadTags = () => {
    if (!props.customHead || !props.customHead.length) return <></>;
    return (
      <>
        {props.customHead.map((item, index) => {
          const { content, props, name } = item;
          return createElement(
            name,
            { ...props, key: `head-tag-${index}` },
            content
          );
        })}
      </>
    );
  };
  return (
    <>
      <Head>
        {Boolean(props?.customCss) && (
          <style>{decode(props.customCss as string)}</style>
        )}
        {renderHeadTags()}
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
