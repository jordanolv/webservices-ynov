import type { NextConfig } from "next";

const apiUrl = process.env.API_URL || 'http://localhost:4091'

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/uploads/:path*', destination: `${apiUrl}/uploads/:path*` }]
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dylanolivier.fr' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 an
  },
};

export default nextConfig;
