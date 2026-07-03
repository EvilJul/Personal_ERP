'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type GoalFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: {
    title: string
    targetValue: number
    unit?: string
    deadline?: string
  }
  goalId?: string
}

export function GoalForm({ mode, defaultValues, goalId }: GoalFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [targetValue, setTargetValue] = useState(
    defaultValues?.targetValue?.toString() ?? ''
  )
  const [unit, setUnit] = useState(defaultValues?.unit ?? '')
  const [deadline, setDeadline] = useState(defaultValues?.deadline ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const body: Record<string, unknown> = {
      title: title.trim(),
      targetValue: Number(targetValue),
    }
    if (unit.trim()) body.unit = unit.trim()
    if (deadline) body.deadline = deadline

    try {
      const url =
        mode === 'edit' ? `/api/goals/${goalId}` : '/api/goals'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '操作失败')
      }

      router.push('/goals')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 标题 */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          目标名称 <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：读完 20 本书"
          maxLength={100}
          required
        />
      </div>

      {/* 目标值 */}
      <div className="space-y-1.5">
        <label htmlFor="targetValue" className="text-sm font-medium text-slate-700">
          目标值 <span className="text-red-500">*</span>
        </label>
        <Input
          id="targetValue"
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder="例如：20"
          min="0.01"
          step="any"
          required
        />
      </div>

      {/* 单位 */}
      <div className="space-y-1.5">
        <label htmlFor="unit" className="text-sm font-medium text-slate-700">
          单位
        </label>
        <Input
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="例如：元、kg、本（可选）"
        />
      </div>

      {/* 截止日期 */}
      <div className="space-y-1.5">
        <label htmlFor="deadline" className="text-sm font-medium text-slate-700">
          截止日期
        </label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting || !title.trim() || !targetValue}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          {submitting
            ? '保存中...'
            : mode === 'edit'
              ? '保存修改'
              : '创建目标'}
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
  )
}
