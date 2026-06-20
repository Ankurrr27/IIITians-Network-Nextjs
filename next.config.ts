import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  serverExternalPackages: ["mongoose"],
  outputFileTracingRoot: path.join(__dirname),
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
