import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  serverExternalPackages: ["mongoose"],
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/iiits",
        destination: "/colleges",
        permanent: true,
      },
      {
        source: "/community",
        destination: "/discuss",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
