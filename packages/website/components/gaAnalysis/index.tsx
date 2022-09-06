import Script from "next/script";
export default function (props: { id: string }) {
  return (
    <>
      {props.id != "" && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${props.id}`}
          ></Script>
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${props.id}');
        `}
          </Script>
        </>
      )}
    </>
  );
}
