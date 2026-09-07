/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const isDev = process.env.NODE_ENV == "development";
const rewites =
  process.env.NODE_ENV == "development"
    ? {
        async rewrites() {
          return [
            {
              source: "/api/comment",
              destination: "http://127.0.0.1:8360/comment", // Proxy to Backend
            },
            {
              source: "/api/:path*",
              destination: "http://127.0.0.1:3000/api/:path*", // Proxy to Backend
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
  const UrlInEnv = (process.env.VAN_BLOG_CDN_URL || "").trim().replace(/\/+$/, "");
  if (UrlInEnv) {
    return { assetPrefix: UrlInEnv };
  } else {
    return {};
  }
};
const adminNoStoreHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, no-cache, must-revalidate",
  },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    largePageDataBytes: 1024 * 1024 * 10,
  },
  images: {
    domains: getAllowDomains(),
  },
  async headers() {
    // Defense in depth if /admin is ever routed to Next.js; public pages stay cacheable.
    return [
      { source: "/admin", headers: adminNoStoreHeaders },
      { source: "/admin/:path*", headers: adminNoStoreHeaders },
    ];
  },
  ...getCdnUrl(),
  ...rewites,
});
