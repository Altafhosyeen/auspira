import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  // Linting/formatting is handled by Biome via the pre-commit hook (staged files only).
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Produces a self-contained Node.js server in .next/standalone — required for the
  // Docker multi-stage build and Azure Container Apps deployment.
  output: 'standalone',
  transpilePackages: [
    'antd',
    '@ant-design',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    '@ant-design/icons',
  ],
  // Strip console.log in production; keep warn/error
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['warn', 'error'] } : false,
  },
  // Enable HTTP keep-alive for backend API calls (reduces connection overhead)
  httpAgentOptions: {
    keepAlive: true,
  },
  async rewrites() {
    if (!backendUrl) {
      return [];
    }

    return [
      {
        source: '/api/organizations/:path*',
        destination: `${backendUrl}/api/organizations/:path*`,
      },
    ];
  },
  // Baseline security headers for every route. X-Frame-Options blocks
  // clickjacking via iframe embedding; nosniff stops MIME-type confusion;
  // Referrer-Policy avoids leaking full URLs (which can carry SAS tokens in
  // query strings) to third-party origins.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

// Bundle-size report — run with: npm run analyze (ANALYZE=true).
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withAnalyzer(nextConfig);
