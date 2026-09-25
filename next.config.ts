import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Required for the Docker deployment (docker/production, docker/staging), which
  // copies .next/standalone + .next/static into a slim runtime image.
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Lets next/image render project photos uploaded via Vercel Blob (see lib/storage.ts) —
    // those are absolute https URLs, unlike the same-origin /uploads/... paths local storage
    // produces, which next/image allows without any config.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
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
