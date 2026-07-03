'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'

type GoalCardProps = {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit?: string
  deadline?: string
  trend?: number
  className?: string
}

function formatProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今天截止'
  if (diffDays <= 7) return `${diffDays} 天后`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function GoalCard({ id, title, currentValue, targetValue, unit, deadline, trend, className }: GoalCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const progress = formatProgress(currentValue, targetValue)

  async function handleDelete() {
    if (!confirm('确定要删除这个目标吗？')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('删除失败')
      }
      router.refresh()
    } catch {
      alert('删除失败，请重试')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-900">{title}</h4>
        {deadline && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            {formatDeadline(deadline)}
          </Badge>
        )}
      </div>

      <div className="mt-3">
        <Progress value={progress}>
          <ProgressLabel className="text-xs text-slate-500">
            {currentValue}{unit ? ` ${unit}` : ''} / {targetValue}{unit ? ` ${unit}` : ''}
          </ProgressLabel>
          <ProgressValue className="text-xs font-medium text-slate-700" />
        </Progress>
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              'mt-1 inline-block text-xs font-medium',
              trend > 0 ? 'text-green-500' : 'text-red-500',
            )}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-3 flex gap-2">
        <Link href={`/goals/${id}/edit`}>
          <Button variant="outline" size="sm">
            编辑
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? '删除中...' : '删除'}
        </Button>
      </div>
    </div>
  )
}
