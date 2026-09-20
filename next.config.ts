import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Required for the Docker deployment (docker/production, docker/staging), which
  // copies .next/standalone + .next/static into a slim runtime image.
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
