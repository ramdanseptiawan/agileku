/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    esmExternals: false,
  },
  images: {
    // Allow all domains for images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    // Alternative: use domains array for broader compatibility
    domains: [],
    // Disable image optimization restrictions
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; frame-src 'self' * data: blob: repo.darmajaya.ac.id https://repo.darmajaya.ac.id; object-src 'self' * data: blob: repo.darmajaya.ac.id https://repo.darmajaya.ac.id; embed-src 'self' * data: blob: repo.darmajaya.ac.id https://repo.darmajaya.ac.id; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *; media-src 'self' *; connect-src 'self' *;",
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
