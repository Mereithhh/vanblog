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

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["www.mereith.com", "pic.mereith.com"],
  },
  ...rewites,
};
