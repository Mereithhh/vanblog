import 'client-only';

import "@waline/client/style";
import React, { useEffect, useRef, useState } from "react";
import { init, WalineInstance, WalineInitOptions } from "@waline/client";

// Get Waline server URL from environment variable or config
export const getWalineServerUrl = (): string => {
  let serverUrl = '';
  // Check for environment variables
  if (typeof window !== 'undefined') {
    // Client-side
    // Check for VAN_BLOG_WALINE_URL first
    if (window.__NEXT_DATA__?.runtimeConfig?.VAN_BLOG_WALINE_URL) {
      serverUrl = window.__NEXT_DATA__.runtimeConfig.VAN_BLOG_WALINE_URL;
      console.log("Using Waline server URL from VAN_BLOG_WALINE_URL:", serverUrl);
      if (serverUrl) return serverUrl;
    }
    
    // Then check for VAN_BLOG_SERVER_URL as fallback
    if (window.__NEXT_DATA__?.runtimeConfig?.VAN_BLOG_SERVER_URL) {
      serverUrl = window.__NEXT_DATA__.runtimeConfig.VAN_BLOG_SERVER_URL;
      console.log("Using Waline server URL from VAN_BLOG_SERVER_URL:", serverUrl);
      if (serverUrl) return serverUrl;
    }
  }
  
  // Default: use the current site URL
  if (typeof window !== 'undefined') {
    // Use the current origin as the base URL
    serverUrl = `${window.location.origin}`;
    console.log("Using default Waline server URL (current origin):", serverUrl);
  }
  
  return serverUrl;
};

export type WalineOptions = Omit<WalineInitOptions, 'el'> & { path: string };

const Waline = (props: WalineOptions) => {
  const walineInstanceRef = useRef<WalineInstance | null>(null);
  const containerRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...props,
      el: containerRef.current,
    });

    return () => walineInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    walineInstanceRef.current?.update(props);
  }, [props]);

  return <div ref={containerRef} />;
};

export default function WalineComponent(props: {
  enable: "true" | "false";
  visible: boolean;
}) {
  const walineUrl = getWalineServerUrl();
  if (props.enable !== "true" || !props.visible || !walineUrl) {
    return null;
  }

  return (
    <div className="mt-2">
      <Waline serverURL={walineUrl} path={window.location.pathname} dark lang='zh' />
    </div>
  );
}
