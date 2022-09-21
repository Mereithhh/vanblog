/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

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
  const isDev = process.env.NODE_ENV == "development";
  if (isDev) {
    return [
      "www.mereith.com",
      "pic.mereith.com",
      "192.168.5.11",
      "blog-demo.mereith.com",
    ];
  }
  const domainsInEnv = process.env.VAN_BLOG_ALLOW_DOMAINS || "";
  if (domainsInEnv && domainsInEnv != "") {
    const arr = domainsInEnv.split(",");
    return arr;
  } else {
    return [];
  }
};
const getCdnUrl = () => {
  const isDev = process.env.NODE_ENV == "development";
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
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: getAllowDomains(),
  },
  ...getCdnUrl(),
  ...rewites,
});
