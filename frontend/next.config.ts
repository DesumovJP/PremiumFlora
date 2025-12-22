import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
      },
      // Railway backend - matches any subdomain
      {
        protocol: "https",
        hostname: "**.up.railway.app",
      },
      // DigitalOcean Spaces - matches any region
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  // Redirect Strapi admin to Railway backend
  async redirects() {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL;
    
    if (strapiUrl) {
      return [
        {
          source: "/strapi-admin/:path*",
          destination: `${strapiUrl}/admin/:path*`,
          permanent: false,
        },
      ];
    }
    
    return [];
  },
};

export default nextConfig;
