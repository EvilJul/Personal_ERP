'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'bg-pattern'

/**
 * 背景图案应用组件
 * 在 body 开头插入一个全屏背景层，避免 CSS 层级问题
 */
export function BackgroundApplier() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'none'
    applyBackground(saved)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        applyBackground(e.newValue || 'none')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return null
}

function applyBackground(pattern: string) {
  // 移除旧的背景层
  const existing = document.getElementById('bg-pattern-layer')
  if (existing) existing.remove()

  if (pattern === 'none') return

  // 创建新的背景层
  const layer = document.createElement('div')
  layer.id = 'bg-pattern-layer'
  layer.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
  `
  layer.className = `bg-pattern-${pattern}`
  document.body.prepend(layer)
}

/**
 * 应用背景图案（供设置页面使用）
 */
export function applyBackgroundPattern(pattern: string) {
  localStorage.setItem(STORAGE_KEY, pattern)
  applyBackground(pattern)
}

/**
 * 获取当前保存的背景图案
 */
export function getSavedBackgroundPattern(): string {
  if (typeof window === 'undefined') return 'none'
  return localStorage.getItem(STORAGE_KEY) || 'none'
}
