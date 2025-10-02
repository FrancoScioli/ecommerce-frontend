import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mi-bucket-ecommerce.s3.sa-east-1.amazonaws.com',
        pathname: '/**',
      },
      // por si cambio el bucket de region 
      {
        protocol: 'https',
        hostname: 'mi-bucket-ecommerce.s3-*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '7m.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-cdn.zecat.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zecat-user-images-prod.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd1yq3fbd6icaus.cloudfront.net',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
