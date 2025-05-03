import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Vercel 빌드 시 ESLint 무시
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://3.34.90.243:8000/:path*', // EC2 FastAPI 서버
      },
    ]
  },
}

export default nextConfig;
