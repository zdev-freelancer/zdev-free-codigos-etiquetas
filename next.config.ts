import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF/WebP first for optimized delivery to mobile shoppers.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Temporary placeholders used by the seed catalog.
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage public bucket (IndepCommerce project) for product imagery.
      {
        protocol: "https",
        hostname: "cimqhmgbjhsdgbvmskmw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Allow image uploads through the admin product Server Action.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
