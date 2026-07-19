import type { NextConfig } from "next";

const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: "/try-on/:version/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
