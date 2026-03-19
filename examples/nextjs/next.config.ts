import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/nextjs',
  transpilePackages: ['@authon/nextjs', '@authon/react', '@authon/js', '@authon/shared'],
}

export default nextConfig
