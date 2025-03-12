import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import getConfig from "next/config";
import { ErrorBoundary } from "react-error-boundary";

// Dynamically import the Waline component to avoid SSR issues
const WalineCore = dynamic(() => import("./core"), {
  ssr: false,
  loading: () => <div id="waline" className="mt-2" style={{ display: "none" }}></div>
});

// Error fallback component for the ErrorBoundary
const ErrorFallback = () => (
  <div className="mt-2 py-4 text-gray-500 text-center">
    评论加载失败
  </div>
);

export default function Waline(props: {
  enable: "true" | "false";
  visible: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  
  // Add a key-based remounting strategy
  const [componentKey, setComponentKey] = useState(0);
  
  // Update key to force remount when visibility changes
  useEffect(() => {
    setComponentKey(prev => prev + 1);
  }, [props.visible]);

  // If not enabled, don't render anything
  if (props.enable !== "true") {
    return null;
  }

  // Always display debugging information in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div>
        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            Error: {error}
          </div>
        )}
        
        {config && (
          <div style={{ fontSize: '12px', color: 'gray', marginBottom: '10px' }}>
            <div>Waline Configuration (debug):</div>
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </div>
        )}
        
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <WalineCore key={componentKey} {...props} />
        </ErrorBoundary>
      </div>
    );
  }

  // In production, just render the Waline component with error boundary
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <WalineCore key={componentKey} {...props} />
    </ErrorBoundary>
  );
}
