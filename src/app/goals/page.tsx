'use client'

import { useEffect, useState } from 'react'
import { GoalsPageClient } from './goals-client'

type Goal = {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit?: string | null
  deadline?: string | null
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGoals() {
      try {
        const res = await fetch('/api/goals')
        if (!res.ok) throw new Error('加载失败')
        const data = await res.json()
        setGoals(data.goals ?? [])
      } catch (error) {
        console.error('[GoalsPage] 加载失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGoals()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen animate-fade-in-up bg-slate-50 pb-20 md:pb-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-300 border-t-green-500" />
            <p className="text-sm text-slate-500">加载中...</p>
          </div>
        </div>
      </main>
    )
  }

  return <GoalsPageClient goals={goals} />
}
