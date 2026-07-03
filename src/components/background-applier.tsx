'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bg-pattern'

/**
 * 背景图案应用组件
 * 从 localStorage 读取用户选择的背景图案，并应用到 document.body
 */
export function BackgroundApplier() {
  const [, setPattern] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'none'
    setPattern(saved)

    // 移除所有 bg-pattern-* 类，添加选中的
    const classes = document.body.className.split(' ').filter(c => !c.startsWith('bg-pattern-'))
    classes.push(`bg-pattern-${saved}`)
    document.body.className = classes.join(' ')

    // 监听 storage 事件，跨标签页同步
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newPattern = e.newValue || 'none'
        setPattern(newPattern)
        const cls = document.body.className.split(' ').filter(c => !c.startsWith('bg-pattern-'))
        cls.push(`bg-pattern-${newPattern}`)
        document.body.className = cls.join(' ')
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return null
}

/**
 * 应用背景图案到 body（供设置页面使用，选择后立即生效）
 */
export function applyBackgroundPattern(pattern: string) {
  localStorage.setItem(STORAGE_KEY, pattern)
  const classes = document.body.className.split(' ').filter(c => !c.startsWith('bg-pattern-'))
  classes.push(`bg-pattern-${pattern}`)
  document.body.className = classes.join(' ')
}

/**
 * 获取当前保存的背景图案
 */
export function getSavedBackgroundPattern(): string {
  if (typeof window === 'undefined') return 'none'
  return localStorage.getItem(STORAGE_KEY) || 'none'
}
