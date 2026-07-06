'use client'

import { useEffect, useState } from 'react'
import { installFetchInterceptor } from '@/lib/fetch-interceptor'
import { ensureBrowserDb } from '@/db/browser'

/**
 * 数据库初始化 Provider
 * 在应用启动时初始化 wa-sqlite 浏览器数据库并安装 fetch 拦截器。
 * 数据库就绪前显示加载状态，就绪后渲染子组件。
 */
export function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // 安装 fetch 拦截器（将 /api/* 请求路由到 wa-sqlite）
        installFetchInterceptor()
        // 确保浏览器数据库已初始化
        await ensureBrowserDb()

        if (!cancelled) {
          setReady(true)
        }
      } catch (error) {
        console.error('[DbProvider] 数据库初始化失败:', error)
        // 即使失败也让应用继续运行
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-300 border-t-green-500" />
          <p className="text-sm text-slate-500">初始化数据库...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
