'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { HabitCard } from '@/components/habit-card'

type Habit = {
  id: string
  title: string
  frequency: string
  linkedGoalId?: string | null
  createdAt: string
  updatedAt: string
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHabits() {
      try {
        const res = await fetch('/api/habits')
        if (!res.ok) {
          throw new Error('加载失败')
        }
        const data = await res.json()
        setHabits(data.habits ?? [])
      } catch {
        setError('加载习惯列表失败，请刷新重试')
      } finally {
        setLoading(false)
      }
    }
    fetchHabits()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
        {/* 页面头部 */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">习惯</h1>
            <p className="mt-1 text-sm text-slate-500">
              养成好习惯，每日打卡
            </p>
          </div>
          <Link href="/habits/new">
            <Button
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              新建习惯
            </Button>
          </Link>
        </header>

        {/* 返回链接 */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            ← 返回仪表盘
          </Link>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-green-500" />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        )}

        {/* 习惯列表 */}
        {!loading && !error && habits.length === 0 && (
          <EmptyState
            icon="✅"
            title="开始养成你的第一个习惯"
            description="每日打卡，培养持久的好习惯"
            action={
              <Link href="/habits/new">
                <Button
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  创建习惯
                </Button>
              </Link>
            }
          />
        )}

        {!loading && !error && habits.length > 0 && (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                frequency={habit.frequency}
                completedToday={false}
                recentDays={[]}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
