// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',  // ← これが必要
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/trends-facet' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/trends-facet/' : '',
}

export default nextConfig