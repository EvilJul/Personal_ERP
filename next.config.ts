import type { NextConfig } from "next";

// 通过 BUILD_TARGET=capacitor 启用 Capacitor 构建模式
const isCapacitor = process.env.BUILD_TARGET === 'capacitor'

const nextConfig: NextConfig = {
  // Capacitor 模式使用 standalone（包含 API 服务器）
  output: isCapacitor ? 'standalone' : 'standalone',
  images: isCapacitor ? { unoptimized: true } : undefined,
  turbopack: {},
  typescript: {
    // 类型检查通过 npm run typecheck 独立运行
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
