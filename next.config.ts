import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
