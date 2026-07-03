'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type HabitCardProps = {
  title: string
  streak: number
  completedToday: boolean
  recentDays?: boolean[]
  onToggle?: (completed: boolean) => void
  className?: string
}

export function HabitCard({ title, streak, completedToday, recentDays = [], onToggle, className }: HabitCardProps) {
  const [completed, setCompleted] = useState(completedToday)
  const [animating, setAnimating] = useState(false)

  function handleToggle() {
    const next = !completed
    setCompleted(next)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 200)
    onToggle?.(next)
  }

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-slate-900">{title}</h4>
          {streak > 0 && (
            <p className="mt-0.5 text-xs text-slate-500">
              连续 {streak} 天
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200',
            completed
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-slate-300 bg-white text-transparent hover:border-green-400',
            animating && 'scale-110'
          )}
          aria-label={completed ? '取消打卡' : '打卡'}
        >
          <svg
            className="size-5"
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
