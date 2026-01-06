/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  typescript: {
    // Disable typed routes during development
    // Remove this once all routes are created
    ignoreBuildErrors: false,
  },
  experimental: {
    typedRoutes: false,
  },
};

module.exports = nextConfig;
