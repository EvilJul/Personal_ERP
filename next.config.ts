import type { NextConfig } from "next";

// 通过 BUILD_TARGET=capacitor 启用 Capacitor 静态导出模式
const isCapacitor = process.env.BUILD_TARGET === 'capacitor'

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : 'standalone',
  images: isCapacitor ? { unoptimized: true } : undefined,
  turbopack: {},
  typescript: {
    // 类型检查通过 npm run typecheck 独立运行
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
