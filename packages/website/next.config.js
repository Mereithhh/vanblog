/** @type {import('next').NextConfig} */

const rewites =
  process.env.NODE_ENV == "development"
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: "http://localhost:3000/api/:path*", // Proxy to Backend
            },
          ];
        },
      }
    : {};

const getAllowDomains = () => {
  const isDev = process.env.NODE_ENV == "development";
  if (isDev) {
    return ["www.mereith.com", "pic.mereith.com", "192.168.5.11"];
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
    return "";
  }
  const UrlInEnv = process.env.VAN_BLOG_CDN_URL || "";
  if (UrlInEnv && UrlInEnv != "") {
    return UrlInEnv;
  } else {
    return "";
  }
};
module.exports = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
  publicRuntimeConfig: {
    images: {
      domains: getAllowDomains(),
    },
  },
  images: {
    domains: getAllowDomains(),
  },
  assetPrefix: getCdnUrl(),
  ...rewites,
};
