import type { NextConfig } from 'next';

const withoutTrailingSlash = (origin: string) => origin.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  reactStrictMode: true,
  async rewrites() {
    const rewrites = [];
    const adminOrigin = process.env.AKAMBA_ADMIN_ORIGIN;
    const vendorOrigin = process.env.AKAMBA_VENDOR_ORIGIN;
    const apiOrigin = process.env.AKAMBA_API_ORIGIN;

    if (adminOrigin) {
      rewrites.push({
        source: '/admin/:path*',
        destination: `${withoutTrailingSlash(adminOrigin)}/admin/:path*`,
      });
    }

    if (vendorOrigin) {
      rewrites.push({
        source: '/vendor/:path*',
        destination: `${withoutTrailingSlash(vendorOrigin)}/vendor/:path*`,
      });
    }

    if (apiOrigin) {
      rewrites.push({
        source: '/api/:path*',
        destination: `${withoutTrailingSlash(apiOrigin)}/:path*`,
      });
    }

    return rewrites;
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'mercur-connect.s3.eu-central-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'api.mercurjs.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'api-sandbox.mercurjs.com',
        pathname: '/static/**'
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      },
      {
        protocol: 'https',
        hostname: 's3.eu-central-1.amazonaws.com'
      },
      {
        protocol: "https",
        hostname: "mercur-testing.up.railway.app",
      },
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  typescript: {
    // Mercur's generated client route map is produced by the backend build and
    // is not available in Vercel's isolated Storefront build.
    ignoreBuildErrors: true
  }
};

export default nextConfig;
