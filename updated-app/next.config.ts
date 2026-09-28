import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'igycibrjzeqrgkhnifoz.supabase.co',
      // add any other domains you use for images
    ],
  },
  // Production builds compile from scratch instead of reusing webpack's
  // persistent cache. Vercel restores .next/cache between deployments, and a
  // corrupted restored cache crashed every later build on two projects
  // (TypeError in WasmHash._updateWithBuffer while re-hashing cached
  // entries). The site is small, so a clean compile costs seconds. The dev
  // server (Turbopack) is unaffected.
  webpack: (config, { dev }) => {
    if (!dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
