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
      // DigitalOcean Spaces
      {
        protocol: "https",
        hostname: "mymediastorage.fra1.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache images for 1 year (immutable assets from CDN)
    minimumCacheTTL: 31536000,
    // Відключаємо перевірку приватних IP для DigitalOcean Spaces
    // (NAT64 резолвить в 64:ff9b::/96 що Next.js вважає "приватним")
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
