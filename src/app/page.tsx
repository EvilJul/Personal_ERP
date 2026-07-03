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

/**
 * 计算目标进度变化趋势
 * 当前实现：返回 0（无历史数据表）
 * 后续可通过 goal_history 表计算近 7 天进度变化百分比
 */
function computeGoalTrend(_goalId: string): number {
  // TODO: 当 goal_history 表建立后，计算 (本周平均进度 - 上周平均进度) / 上周平均进度 * 100
  return 0
}

/**
 * 计算连续打卡天数（从今天或昨天往回数）
 * 返回连续打卡天数
 */
function computeHabitStreak(completedDates: Set<string>): number {
  let streak = 0
  const date = new Date()
  const todayStr = date.toISOString().split('T')[0]

  // 从今天开始检查，如果今天未打卡则从昨天开始
  if (!completedDates.has(todayStr)) {
    date.setDate(date.getDate() - 1)
  }

  while (true) {
    const dateStr = date.toISOString().split('T')[0]
    if (completedDates.has(dateStr)) {
      streak++
      date.setDate(date.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * 计算近 14 天打卡率趋势
 * 返回最近 7 天完成率 - 前 7 天完成率（百分点差值）
 */
function computeHabitCompletionTrend(completedDates: Set<string>): number {
  const today = new Date()
  let recent7 = 0
  let prev7 = 0

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completedDates.has(d.toISOString().split('T')[0])) {
      recent7++
    }
  }

  for (let i = 7; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completedDates.has(d.toISOString().split('T')[0])) {
      prev7++
    }
  }

  return Math.round(((recent7 - prev7) / 7) * 100)
}

/** 计算近7天打卡记录 */
function computeRecentDaysFromSet(completedDates: Set<string>): boolean[] {
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

  // 计算习惯的展示字段 + 趋势
  const habits = rawHabits.map(habit => {
    const entries = db.select().from(habitEntries)
      .where(eq(habitEntries.habitId, habit.id))
      .all()

    const completedDates = new Set(
      entries.filter(e => e.completed === 1).map(e => e.date)
    )

    const recentDays = computeRecentDaysFromSet(completedDates)
    const streak = computeHabitStreak(completedDates)
    const completionTrend = computeHabitCompletionTrend(completedDates)

    return {
      id: habit.id,
      title: habit.title,
      frequency: habit.frequency,
      streak,
      completedToday: recentDays[recentDays.length - 1] ?? false,
      recentDays,
      completionTrend,
    }
  })

  // 计算目标趋势数据
  const goalsWithTrend = goals.map(goal => ({
    ...goal,
    trend: computeGoalTrend(goal.id),
  }))

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
          <GoalsSection goals={goalsWithTrend} />
          <HabitsSection habits={habits} />
        </div>
      </div>
    </main>
  )
}
