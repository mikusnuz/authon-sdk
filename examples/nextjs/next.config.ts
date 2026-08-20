import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  basePath: '/nextjs',
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  transpilePackages: ['@authon/nextjs', '@authon/react', '@authon/js', '@authon/shared'],
}

export default nextConfig
