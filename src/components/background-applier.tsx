'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'bg-pattern'

/**
 * 背景图案应用组件
 * 从 localStorage 读取用户选择的背景图案，应用到 html 元素的 data 属性
 * 使用 data 属性而非 body class，避免被 React 重渲染覆盖
 */
export function BackgroundApplier() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'none'
    document.documentElement.setAttribute('data-bg-pattern', saved)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        document.documentElement.setAttribute('data-bg-pattern', e.newValue || 'none')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return null
}

/**
 * 应用背景图案（供设置页面使用）
 */
export function applyBackgroundPattern(pattern: string) {
  localStorage.setItem(STORAGE_KEY, pattern)
  document.documentElement.setAttribute('data-bg-pattern', pattern)
}

/**
 * 获取当前保存的背景图案
 */
export function getSavedBackgroundPattern(): string {
  if (typeof window === 'undefined') return 'none'
  return localStorage.getItem(STORAGE_KEY) || 'none'
}
