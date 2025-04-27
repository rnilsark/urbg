const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*', // ✨ Don't touch API paths!
      },
      {
        source: '/',
        destination: '/index.html', // Static HTML game
      },
    ];
  },
};

export default nextConfig;
