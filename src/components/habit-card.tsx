'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type HabitCardProps = {
  /** 习惯 ID，不传则禁用打卡 API 调用（仪表盘预览模式） */
  id?: string
  title: string
  frequency?: string
  streak?: number
  completedToday: boolean
  recentDays?: boolean[]
  completionTrend?: number
  onCheckinChange?: (completed: boolean) => void
  className?: string
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: '每天',
  weekly: '每周',
}

export function HabitCard({
  id,
  title,
  frequency,
  streak = 0,
  completedToday,
  recentDays = [],
  completionTrend,
  onCheckinChange,
  className,
}: HabitCardProps) {
  const [completed, setCompleted] = useState(completedToday)
  const [animating, setAnimating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 今日日期 YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  async function handleCheckin() {
    if (submitting) return

    const next = !completed
    setCompleted(next)      // 乐观更新
    setAnimating(true)
    setSubmitting(true)

    // 无 ID 时仅做本地切换（仪表盘预览模式）
    if (!id) {
      onCheckinChange?.(next)
      setTimeout(() => setAnimating(false), 200)
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch(`/api/habits/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today }),
      })
      if (!res.ok) throw new Error('Failed')
      onCheckinChange?.(next)
    } catch {
      setCompleted(!next)   // 回滚
    } finally {
      setTimeout(() => setAnimating(false), 200)
      setSubmitting(false)
    }
  }

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-slate-900">{title}</h4>
          <div className="mt-0.5 flex items-center gap-2">
            {streak > 0 && (
              <span className="text-xs text-slate-500">
                连续 {streak} 天
              </span>
            )}
            {completionTrend !== undefined && completionTrend !== 0 && (
              <span
                className={cn(
                  'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                  completionTrend > 0
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-500',
                )}
              >
                {completionTrend > 0 ? '↑' : '↓'} {Math.abs(completionTrend)}%
              </span>
            )}
            {frequency && (
              <span className="text-xs text-slate-400">
                {FREQUENCY_LABELS[frequency] ?? frequency}
              </span>
            )}
          </div>
        </div>

        {/* 打卡按钮 */}
        <div className="flex items-center gap-2">
          <Link
            href={`/habits/${id}/edit`}
            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
            aria-label="编辑习惯"
          >
            编辑
          </Link>
          <button
            type="button"
            onClick={handleCheckin}
            disabled={submitting}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200',
              completed
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
              animating && 'scale-110',
              submitting && 'opacity-70',
            )}
            aria-label={completed ? '取消打卡' : '打卡'}
          >
            <svg
              className="size-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 10 8 14 16 6" />
            </svg>
          </button>
        </div>
      </div>

      {recentDays.length > 0 && (
        <Sparkline days={recentDays} className="mt-3" />
      )}
    </div>
  )
}

type SparklineProps = {
  days: boolean[]
  className?: string
}

function Sparkline({ days, className }: SparklineProps) {
  const width = 120
  const height = 24
  const step = days.length > 1 ? width / (days.length - 1) : width

  const points = days.map((done, i) => {
    const x = i * step
    const y = done ? 4 : height - 4
    return `${x},${y}`
  }).join(' ')

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0 overflow-visible"
      >
        <polyline
          points={points}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs text-slate-400">
        近 {days.length} 天
      </span>
    </div>
  )
}
