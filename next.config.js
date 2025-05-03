/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://3.34.90.243:8000/:path*',
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  