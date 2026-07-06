'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'bg-pattern'

/**
 * 背景图案应用组件
 * 直接给 html 元素添加背景样式，避免被页面内容遮盖
 */
export function BackgroundApplier() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'none'
    applyBg(saved)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        applyBg(e.newValue || 'none')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return null
}

function applyBg(pattern: string) {
  const html = document.documentElement

  // 移除旧的背景类
  html.className = html.className.replace(/bg-pattern-\w+/g, '').trim()

  // 添加新的背景类
  if (pattern !== 'none') {
    html.classList.add(`bg-pattern-${pattern}`)
  }
}

/**
 * 应用背景图案（供设置页面使用）
 */
export function applyBackgroundPattern(pattern: string) {
  localStorage.setItem(STORAGE_KEY, pattern)
  applyBg(pattern)
}

/**
 * 获取当前保存的背景图案
 */
export function getSavedBackgroundPattern(): string {
  if (typeof window === 'undefined') return 'none'
  return localStorage.getItem(STORAGE_KEY) || 'none'
}
