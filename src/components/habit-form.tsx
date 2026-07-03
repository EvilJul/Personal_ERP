'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type HabitFormProps = {
  /** 编辑模式下的初始数据 */
  initialData?: {
    id: string
    title: string
    frequency: string
    linkedGoalId?: string | null
  }
  className?: string
}

export function HabitForm({ initialData, className }: HabitFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [frequency, setFrequency] = useState(initialData?.frequency ?? 'daily')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const url = isEditing ? `/api/habits/${initialData!.id}` : '/api/habits'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          frequency,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? '操作失败')
      }

      router.push('/habits')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      {/* 标题 */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
          习惯名称 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          placeholder="例如：每天冥想 10 分钟"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      {/* 频率 */}
      <div>
        <label htmlFor="frequency" className="mb-1.5 block text-sm font-medium text-slate-700">
          频率
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="daily">每天</option>
          <option value="weekly">每周</option>
        </select>
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting || !title.trim()}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          {submitting
            ? (isEditing ? '保存中...' : '创建中...')
            : (isEditing ? '保存' : '创建')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.back()}
        >
          取消
        </Button>
      </div>
    </form>
  )
}
