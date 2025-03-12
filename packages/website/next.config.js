/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const isDev = process.env.NODE_ENV == "development";
const isBrowser = typeof window !== 'undefined';

// Extract rewrite rules into a function that can be used in both dev and production
const getRewriteRules = () => {
  console.log('Configuring Next.js rewrites with:');
  console.log('- VAN_BLOG_WALINE_URL:', process.env.VAN_BLOG_WALINE_URL || 'http://127.0.0.1:8360/comment (default)');
  console.log('- VAN_BLOG_SERVER_URL:', process.env.VAN_BLOG_SERVER_URL || 'http://127.0.0.1:3000 (default)');
  console.log('- NEXT_PUBLIC_VANBLOG_SERVER_URL:', process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL || '(not set, will use VAN_BLOG_SERVER_URL)');
  
  // Use client URL for API proxy if available, otherwise fall back to server URL
  const apiBaseUrl = (isBrowser ? process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL : process.env.VAN_BLOG_SERVER_URL) || "http://127.0.0.1:3000";
  const walineBaseUrl = process.env.VAN_BLOG_WALINE_URL || "http://127.0.0.1:8360";

  return [
    {
      source: "/api/comment",
      destination: `${walineBaseUrl}/comment`, // Proxy to Waline
    },
    {
      source: "/api/article",
      destination: `${walineBaseUrl}/article`, // Proxy to Waline for article statistics
    },
    {
      // Make sure all API requests are properly proxied
      source: "/api/:path*",
      destination: `${apiBaseUrl}/api/:path*`, // Proxy to Backend
    },
  ];
};

// Configure rewrites for all environments
const rewrites = {
  async rewrites() {
    return getRewriteRules();
  }
};

const getAllowDomains = () => {
  const domainsInEnv = process.env.VAN_BLOG_ALLOW_DOMAINS || "";
  if (domainsInEnv && domainsInEnv != "") {
    const arr = domainsInEnv.split(",");
    return arr;
  } else {
    if (isDev) {
      return ["pic.mereith.com",'localhost','127.0.0.1'];
    }
    return [];
  }
};
const getCdnUrl = () => {
  if (isDev) {
    return {};
  }
  const UrlInEnv = process.env.VAN_BLOG_CDN_URL || "";
  if (UrlInEnv && UrlInEnv != "") {
    return { assetPrefix: UrlInEnv };
  } else {
    return {};
  }
};

// Define all the environment variables that should be available to the client
const clientEnvVars = {
  VAN_BLOG_VERSION: process.env.VAN_BLOG_VERSION || '',
  VAN_BLOG_WALINE_URL: process.env.VAN_BLOG_WALINE_URL || '',
  VAN_BLOG_SERVER_URL: process.env.VAN_BLOG_SERVER_URL || '',
  NEXT_PUBLIC_VANBLOG_SERVER_URL: process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL || '',
  VAN_BLOG_REVALIDATE: process.env.VAN_BLOG_REVALIDATE || '',
  VAN_BLOG_REVALIDATE_TIME: process.env.VAN_BLOG_REVALIDATE_TIME || '',
  VAN_BLOG_REVALIDATE_ON_ERROR: process.env.VAN_BLOG_REVALIDATE_ON_ERROR || '',
  VAN_BLOG_API_TIMEOUT: process.env.VAN_BLOG_API_TIMEOUT || '',
  VAN_BLOG_API_MAX_RETRIES: process.env.VAN_BLOG_API_MAX_RETRIES || '',
};

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    largePageDataBytes: 1024 * 1024 * 10,
  },
  images: {
    domains: getAllowDomains(),
  },
  ...getCdnUrl(),
  ...rewrites,
  // Make environment variables available to client-side code
  // https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
  publicRuntimeConfig: clientEnvVars,
  env: clientEnvVars,
});
