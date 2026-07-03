'use client'

import { useEffect, useState } from 'react'

type ProgressRingProps = {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({ percentage, size = 48, strokeWidth = 4, className }: ProgressRingProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  useEffect(() => {
    // 触发从 0 到目标值的动画
    const timer = requestAnimationFrame(() => {
      setAnimatedPercent(percentage)
    })
    return () => cancelAnimationFrame(timer)
  }, [percentage])

  const offset = circumference - (animatedPercent / 100) * circumference

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-600 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">
        {percentage}%
      </span>
    </div>
  )
}
