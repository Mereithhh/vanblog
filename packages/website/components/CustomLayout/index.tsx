import { decode } from "js-base64";
import Head from "next/head";
import Script from "next/script";
import { createElement } from "react";

import { type HeadTag } from "../../utils/getLayoutProps";

export default function (props: {
  customCss?: string;
  customHtml?: string;
  customScript?: string;
  customHead?: HeadTag[];
}) {
  const renderHeadTags = () => {
    if (props.customHead?.length) {
      return (
        <>
          {props.customHead.map(({ content, props, name }, index) =>
            createElement(name, { ...props, key: `head-tag-${index}` }, content)
          )}
        </>
      );
    }

    return <></>;
  };

  return (
    <>
      <Head>
        {props.customCss ? <style>{decode(props.customCss)}</style> : null}
        {renderHeadTags()}
      </Head>
      {props.customHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: decode(props.customHtml) }}
        ></div>
      ) : null}
      {props.customScript ? (
        <Script strategy="beforeInteractive">{`${decode(
          props.customScript
        )}`}</Script>
      ) : null}
    </>
  );
}
