import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/og": ["./src/app/fonts/**/*.ttf"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "userpic.codeforces.org",
      },
      {
        protocol: "https",
        hostname: "assets.leetcode.com",
      },
      {
        protocol: "https",
        hostname: "cdn.codechef.com",
      },
      {
        protocol: "https",
        hostname: "www.codechef.com",
      },
    ],
  },
};

export default nextConfig;
