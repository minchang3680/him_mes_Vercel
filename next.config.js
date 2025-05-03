/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // 👉 eslint 에러 무시하고 빌드 통과시킴
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://3.34.90.243:8000/:path*', // 👉 EC2 FastAPI로 proxy
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  