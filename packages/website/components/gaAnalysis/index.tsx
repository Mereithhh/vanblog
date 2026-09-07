import Script from "next/script";
import { describeGaInjection } from "./load";

export default function GaAnalysis(props: { id: string }) {
  const injection = describeGaInjection(props.id);
  if (!injection) {
    return null;
  }
  return (
    <>
      <Script
        strategy={injection.strategy}
        src={injection.src}
        async={injection.async}
      ></Script>
      <Script id="google-analytics" strategy={injection.strategy}>
        {injection.initSnippet}
      </Script>
    </>
  );
}
