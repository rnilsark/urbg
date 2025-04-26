/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensures phaser works correctly with webpack 5
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback, 
      fs: false,
      path: false,
    };
    return config;
  },
  // Add rewrites to serve the static HTML directly
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
};

export default nextConfig; 