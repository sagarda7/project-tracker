import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Required for the Docker deployment (docker/production, docker/staging), which
  // copies .next/standalone + .next/static into a slim runtime image.
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Next's default is 1MB, well under our own per-file limits (see lib/constants.ts),
      // so a single valid attachment could still blow up the request with an unhandled
      // framework-level error. Sized to comfortably fit several 2MB attachments at once.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
