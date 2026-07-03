'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Settings = {
  actualServerUrl: string | null
  actualPassword: string | null
  actualBudgetId: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [serverUrl, setServerUrl] = useState('')
  const [password, setPassword] = useState('')
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [budgetId, setBudgetId] = useState('')

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) {
          throw new Error('获取设置失败')
        }
        const data = await res.json()
        const s: Settings = data.settings
        setServerUrl(s.actualServerUrl ?? '')
        // 密码字段显示占位符，不回填真实密码
        setPassword(s.actualPassword ? '••••••••' : '')
        setBudgetId(s.actualBudgetId ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const body: Record<string, unknown> = {
      actualServerUrl: serverUrl.trim() || null,
      actualBudgetId: budgetId.trim() || null,
    }

    // 仅在用户修改了密码时才发送
    if (passwordChanged) {
      body.actualPassword = password.trim() || null
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '保存失败')
      }

      setSuccess(true)
      setPasswordChanged(false)
      // 重新获取最新设置，刷新密码占位符
      const refreshRes = await fetch('/api/settings')
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        const s: Settings = data.settings
        setPassword(s.actualPassword ? '••••••••' : '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
        <div className="mx-auto max-w-lg px-4 py-6 md:px-6 md:py-8">
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-lg px-4 py-6 md:px-6 md:py-8">
        {/* 返回链接 */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 页面标题 */}
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">设置</h1>

        {/* Actual Budget 配置卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>Actual Budget 连接</CardTitle>
            <CardDescription>
              配置 Actual Budget 服务器连接，用于同步财务数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 服务器地址 */}
              <div className="space-y-1.5">
                <label
                  htmlFor="serverUrl"
                  className="text-sm font-medium text-slate-700"
                >
                  服务器地址
                </label>
                <Input
                  id="serverUrl"
                  type="url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="例如：https://actual.example.com"
                />
              </div>

              {/* 密码 */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  密码
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordChanged(true)
                  }}
                  placeholder="输入新密码以更新"
                />
                <p className="text-xs text-slate-400">
                  {passwordChanged ? '已修改，保存后生效' : '留空则不更新密码'}
                </p>
              </div>

              {/* 预算 ID */}
              <div className="space-y-1.5">
                <label
                  htmlFor="budgetId"
                  className="text-sm font-medium text-slate-700"
                >
                  预算 ID
                </label>
                <Input
                  id="budgetId"
                  value={budgetId}
                  onChange={(e) => setBudgetId(e.target.value)}
                  placeholder="Actual Budget 的同步 ID"
                />
              </div>

              {/* 错误提示 */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* 成功提示 */}
              {success && (
                <p className="text-sm text-green-600">设置已保存</p>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  {submitting ? '保存中...' : '保存设置'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
