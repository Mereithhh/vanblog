/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const isDev = process.env.NODE_ENV == "development";
const rewites =
  process.env.NODE_ENV == "development"
    ? {
        async rewrites() {
          console.log('Configuring Next.js rewrites with:');
          console.log('- VAN_BLOG_WALINE_URL:', process.env.VAN_BLOG_WALINE_URL || 'http://172.18.0.2:8360/comment (default)');
          console.log('- VAN_BLOG_SERVER_URL:', process.env.VAN_BLOG_SERVER_URL || 'http://172.18.0.2:3000 (default)');
          console.log('- NEXT_PUBLIC_VANBLOG_SERVER_URL:', process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL || '(not set, will use VAN_BLOG_SERVER_URL)');
          
          // Use client URL for API proxy if available, otherwise fall back to server URL
          const apiBaseUrl = process.env.NEXT_PUBLIC_VANBLOG_SERVER_URL || process.env.VAN_BLOG_SERVER_URL || "http://172.18.0.2:3000";
          
          return [
            {
              source: "/api/comment",
              destination: process.env.VAN_BLOG_WALINE_URL || "http://172.18.0.2:8360/comment", // Proxy to Waline
            },
            {
              source: "/api/article",
              destination: process.env.VAN_BLOG_WALINE_URL?.replace('/comment', '/article') || "http://172.18.0.2:8360/article", // Proxy to Waline
            },
            {
              // Make sure all API requests are properly proxied
              source: "/api/:path*",
              destination: `${apiBaseUrl}/api/:path*`, // Proxy to Backend
            },
          ];
        },
      }
    : {};

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
  ...rewites,
  // Make environment variables available to client-side code
  // https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
  publicRuntimeConfig: clientEnvVars,
  env: clientEnvVars,
});
