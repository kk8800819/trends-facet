// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',  // ← これが必要
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig