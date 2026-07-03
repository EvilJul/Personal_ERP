import { InsightsSection } from '@/components/insights-section'
import { GoalsSection } from '@/components/goals-section'
import { HabitsSection } from '@/components/habits-section'
import { getAllGoals } from '@/db/queries/goals'
import { getAllHabits } from '@/db/queries/habits'
import { getAllInsights } from '@/db/queries/insights'
import { db } from '@/db'
import { habitEntries } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/** 计算连续打卡天数（从昨天往回数） */
function computeStreak(habitId: string): number {
  const entries = db.select().from(habitEntries)
    .where(eq(habitEntries.habitId, habitId))
    .all()

  const completedDates = new Set(
    entries.filter(e => e.completed === 1).map(e => e.date)
  )

  let streak = 0
  const date = new Date()
  date.setDate(date.getDate() - 1) // 从昨天开始检查

  while (true) {
    const dateStr = date.toISOString().split('T')[0]
    if (completedDates.has(dateStr)) {
      streak++
      date.setDate(date.getDate() - 1)
    } else {
      break
    }
  }

  // 如果今天已完成，streak +1
  const todayStr = new Date().toISOString().split('T')[0]
  if (completedDates.has(todayStr)) {
    streak++
  }

  return streak
}

/** 计算近7天打卡记录 */
function computeRecentDays(habitId: string): boolean[] {
  const entries = db.select().from(habitEntries)
    .where(eq(habitEntries.habitId, habitId))
    .all()

  const completedDates = new Set(
    entries.filter(e => e.completed === 1).map(e => e.date)
  )

  const days: boolean[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(completedDates.has(date.toISOString().split('T')[0]))
  }

  return days
}

export default async function DashboardPage() {
  const goals = getAllGoals()
  const rawHabits = getAllHabits()
  const rawInsights = getAllInsights()

  // 计算习惯的展示字段
  const habits = rawHabits.map(habit => {
    const recentDays = computeRecentDays(habit.id)
    return {
      id: habit.id,
      title: habit.title,
      frequency: habit.frequency,
      streak: computeStreak(habit.id),
      completedToday: recentDays[recentDays.length - 1] ?? false,
      recentDays,
    }
  })

  // 映射洞察的 source 字段
  const insights = rawInsights.map(insight => ({
    id: insight.id,
    message: insight.message,
    severity: insight.severity as 'info' | 'warning' | 'success',
    source: insight.ruleId ? '规则引擎' : undefined,
  }))

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* 页面标题 */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Personal ERP
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            你的个人生活管理系统
          </p>
        </header>

        {/* Insights - 全宽 */}
        <InsightsSection insights={insights} className="mb-6 md:mb-8" />

        {/* Goals + Habits 双栏（Desktop）/ 单栏（Tablet & Mobile） */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[3fr_2fr]">
          <GoalsSection goals={goals} />
          <HabitsSection habits={habits} />
        </div>
      </div>
    </main>
  )
}
