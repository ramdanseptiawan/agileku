/** @type {import('next').NextConfig} */
const nextConfig = {
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
            value: "frame-src 'self' * repo.darmajaya.ac.id https://repo.darmajaya.ac.id; object-src 'self' * repo.darmajaya.ac.id https://repo.darmajaya.ac.id; embed-src 'self' * repo.darmajaya.ac.id https://repo.darmajaya.ac.id; img-src 'self' data: blob: *; media-src 'self' *;",
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
