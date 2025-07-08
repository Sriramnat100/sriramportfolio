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
};

export default nextConfig;
