// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 静的エクスポート設定は後で追加
  // output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // これを追加
}

export default nextConfig