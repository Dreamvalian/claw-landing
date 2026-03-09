import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  
  // Note: rewrites require server-side rendering (not static export)
  // Proxy API requests to backend (fixes HTTPS -> HTTP mixed content)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://31.220.83.247:3456/api/:path*',
      },
    ];
  },
  
  // Ensure we don't use static export (breaks rewrites)
  // Remove 'output: export' if present
};

export default nextConfig;
