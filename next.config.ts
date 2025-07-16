import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname)
    return config
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.sa-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        hostname: 'localhost'
      },
      {
        hostname: 'https://7M.onrender.com'
      }
    ],
    // bucket región
  },
};

export default nextConfig;
