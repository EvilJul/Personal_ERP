#!/bin/bash
# Capacitor 静态导出构建脚本
# 用法: ./scripts/cap-build.sh 或 npm run cap:build
#
# 静态导出不支持 API Routes、middleware 和 Server Actions，
# 此脚本临时移除这些文件，构建后恢复。

set -e

API_DIR="src/app/api"
MIDDLEWARE="src/middleware.ts"
LOGIN_DIR="src/app/login"

TMP_DIR=".cap-build-tmp"

cleanup() {
  # 恢复被移走的文件/目录
  if [ -d "$TMP_DIR/api" ]; then
    mv "$TMP_DIR/api" "$API_DIR"
    echo "[cap-build] 已恢复 API routes 目录"
  fi
  if [ -f "$TMP_DIR/middleware.ts" ]; then
    mv "$TMP_DIR/middleware.ts" "$MIDDLEWARE"
    echo "[cap-build] 已恢复 middleware.ts"
  fi
  if [ -d "$TMP_DIR/login" ]; then
    mv "$TMP_DIR/login" "$LOGIN_DIR"
    echo "[cap-build] 已恢复 login 目录"
  fi
  rm -rf "$TMP_DIR" 2>/dev/null || true
}

# 确保退出时恢复文件
trap cleanup EXIT

# 创建临时目录
mkdir -p "$TMP_DIR"

# 移走不兼容静态导出的文件
if [ -d "$API_DIR" ]; then
  mv "$API_DIR" "$TMP_DIR/api"
  echo "[cap-build] 临时移除 API routes 目录"
fi

if [ -f "$MIDDLEWARE" ]; then
  mv "$MIDDLEWARE" "$TMP_DIR/middleware.ts"
  echo "[cap-build] 临时移除 middleware.ts"
fi

if [ -d "$LOGIN_DIR" ]; then
  mv "$LOGIN_DIR" "$TMP_DIR/login"
  echo "[cap-build] 临时移除 login 目录（Server Actions 不兼容静态导出）"
fi

# 运行构建
echo "[cap-build] 开始 Capacitor 静态导出构建..."
BUILD_TARGET=capacitor npx next build

echo ""
echo "[cap-build] 静态导出完成！文件在 out/ 目录"
