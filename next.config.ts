import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  
  // Proxy API requests to backend (fixes HTTPS -> HTTP mixed content)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://31.220.83.247:3456/api/:path*',
      },
    ];
  },
};

export default nextConfig;
