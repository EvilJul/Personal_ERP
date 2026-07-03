import { InsightsSection } from '@/components/insights-section'
import { GoalsSection } from '@/components/goals-section'
import { HabitsSection } from '@/components/habits-section'
import { BadgesSection } from '@/components/badges-section'
import { StatsBar } from '@/components/stats-bar'
import { getAllGoals } from '@/db/queries/goals'
import { getAllHabits } from '@/db/queries/habits'
import { getAllInsights } from '@/db/queries/insights'
import { getAllBadgesWithUserStatus } from '@/db/queries/badges'
import { db } from '@/db'
import { habitEntries } from '@/db/schema'

export const dynamic = 'force-dynamic'

/**
 * 获取本地日期字符串（YYYY-MM-DD 格式）
 * 替代 toISOString().split('T')[0]，避免 UTC 时区偏移导致日期错误
 */
function getLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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
  const todayStr = getLocalDate(date)

  // 从今天开始检查，如果今天未打卡则从昨天开始
  if (!completedDates.has(todayStr)) {
    date.setDate(date.getDate() - 1)
  }

  while (true) {
    const dateStr = getLocalDate(date)
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
    if (completedDates.has(getLocalDate(d))) {
      recent7++
    }
  }

  for (let i = 7; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completedDates.has(getLocalDate(d))) {
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
    days.push(completedDates.has(getLocalDate(date)))
  }

  return days
}

export default async function DashboardPage() {
  const goals = getAllGoals()
  const rawHabits = getAllHabits()
  const rawInsights = getAllInsights()
  const allBadges = getAllBadgesWithUserStatus()

  // 一次性查询所有 habit entries，按 habitId 分组（修复 N+1 查询）
  const allEntries = db.select().from(habitEntries).all()
  const entriesByHabitId = new Map<string, typeof allEntries>()
  for (const entry of allEntries) {
    const list = entriesByHabitId.get(entry.habitId) || []
    list.push(entry)
    entriesByHabitId.set(entry.habitId, list)
  }

  // 计算习惯的展示字段 + 趋势 + 打卡率
  const habits = rawHabits
    .map(habit => {
    const entries = entriesByHabitId.get(habit.id) || []

    const completedDates = new Set(
      entries.filter(e => e.completed === 1).map(e => e.date)
    )

    const recentDays = computeRecentDaysFromSet(completedDates)
    const streak = computeHabitStreak(completedDates)
    const completionTrend = computeHabitCompletionTrend(completedDates)

    // 打卡率 = 近 7 天完成天数 / 7
    const checkinRate = recentDays.filter(Boolean).length / recentDays.length

    return {
      id: habit.id,
      title: habit.title,
      frequency: habit.frequency,
      streak,
      completedToday: recentDays[recentDays.length - 1] ?? false,
      recentDays,
      completionTrend,
      checkinRate,
    }
  })
  .sort((a, b) => b.checkinRate - a.checkinRate)

  // 计算目标趋势数据 + 排序（按进度百分比降序）
  const goalsWithTrend = goals
    .map(goal => ({
      ...goal,
      trend: computeGoalTrend(goal.id),
      progressPercent: goal.targetValue > 0 ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) : 0,
    }))
    .sort((a, b) => b.progressPercent - a.progressPercent)

  // 映射洞察的 source 字段
  const insights = rawInsights.map(insight => ({
    id: insight.id,
    message: insight.message,
    severity: insight.severity as 'info' | 'warning' | 'success',
    source: insight.ruleId ? '规则引擎' : undefined,
  }))

  // 计算统计指标
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.targetValue > 0 ? Math.min((g.currentValue / g.targetValue) * 100, 100) : 0), 0) / goals.length)
    : 0

  const todayStr = getLocalDate()
  const totalHabits = habits.length
  const completedTodayCount = habits.filter(h => h.completedToday).length
  const checkinRate = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0

  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

  return (
    <main className="min-h-screen pb-20 md:pb-8 animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* 统计卡片栏 */}
        <StatsBar
          goalProgress={avgGoalProgress}
          checkinRate={checkinRate}
          streakDays={maxStreak}
          insightCount={insights.length}
        />

        <hr className="divider-gradient mb-6 md:mb-8" />

        {/* Insights - 2列网格 */}
        <InsightsSection insights={insights} className="mb-8" />

        <hr className="divider-gradient mb-6 md:mb-8" />

        {/* Goals + Habits 双栏（5:3 比例） */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[5fr_3fr]">
          <GoalsSection goals={goalsWithTrend} total={goals.length} />
          <HabitsSection habits={habits} total={rawHabits.length} />
        </div>

        <hr className="divider-gradient my-6 md:my-8" />

        {/* Badges 徽章区域 */}
        <BadgesSection badges={allBadges} />
      </div>
    </main>
  )
}
