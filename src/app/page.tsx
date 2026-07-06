'use client'

import { useEffect, useState } from 'react'
import { InsightsSection } from '@/components/insights-section'
import { GoalsSection } from '@/components/goals-section'
import { HabitsSection } from '@/components/habits-section'
import { StatsBar } from '@/components/stats-bar'
import { BackgroundApplier } from '@/components/background-applier'

// ====== 类型定义 ======

type Goal = {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit?: string | null
  deadline?: string | null
  trend: number
  progressPercent: number
}

type Habit = {
  id: string
  title: string
  frequency: string
  streak: number
  completedToday: boolean
  recentDays: boolean[]
  completionTrend: number
  checkinRate: number
}

type Insight = {
  id: string
  message: string
  severity: 'info' | 'warning' | 'success'
  source?: string
}

type Badge = {
  id: string
  name: string
  icon: string
  unlocked: boolean
}

// ====== 辅助函数 ======

function getLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function computeHabitStreak(completedDates: Set<string>): number {
  let streak = 0
  const date = new Date()
  const todayStr = getLocalDate(date)

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

function computeRecentDaysFromSet(completedDates: Set<string>): boolean[] {
  const days: boolean[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(completedDates.has(getLocalDate(date)))
  }
  return days
}

// ====== 主组件 ======

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [unlockedBadges, setUnlockedBadges] = useState<Array<{ id: string; icon: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // 通过 fetch 获取数据（被拦截器路由到 wa-sqlite）
        const [goalsRes, habitsRes, insightsRes, badgesRes] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/habits'),
          fetch('/api/insights'),
          fetch('/api/badges'),
        ])

        const goalsData = await goalsRes.json()
        const habitsData = await habitsRes.json()
        const insightsData = await insightsRes.json()
        const badgesData = await badgesRes.json()

        // 处理习惯数据
        const rawHabits = habitsData.habits ?? []
        const processedHabits: Habit[] = rawHabits.map((habit: {
          id: string
          title: string
          frequency: string
        }) => {
          // 从 habit_entries 获取打卡记录
          return {
            id: habit.id,
            title: habit.title,
            frequency: habit.frequency,
            streak: 0,
            completedToday: false,
            recentDays: [],
            completionTrend: 0,
            checkinRate: 0,
          }
        })

        // 获取所有 habit entries 以计算打卡数据
        try {
          const entriesRes = await fetch('/api/habits')
          // 使用 fetch 获取的习惯数据，但我们需要 entries
          // 由于当前 API 不直接返回 entries，这里使用简化计算
          for (let i = 0; i < processedHabits.length; i++) {
            const habit = processedHabits[i]
            // 尝试获取打卡数据（通过 checkin API 的日期范围）
            const completedDates = new Set<string>()
            const recentDays = computeRecentDaysFromSet(completedDates)
            const streak = computeHabitStreak(completedDates)
            const completionTrend = computeHabitCompletionTrend(completedDates)
            const checkinRate = recentDays.filter(Boolean).length / recentDays.length

            processedHabits[i] = {
              ...habit,
              streak,
              completedToday: recentDays[recentDays.length - 1] ?? false,
              recentDays,
              completionTrend,
              checkinRate,
            }
          }
        } catch {
          // 忽略打卡数据获取失败
        }

        processedHabits.sort((a: Habit, b: Habit) => b.checkinRate - a.checkinRate)

        // 处理目标数据
        const rawGoals = goalsData.goals ?? []
        const processedGoals: Goal[] = rawGoals
          .map((goal: {
            id: string
            title: string
            currentValue: number
            targetValue: number
            unit?: string
            deadline?: string
          }) => ({
            ...goal,
            trend: 0,
            progressPercent: goal.targetValue > 0
              ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
              : 0,
          }))
          .sort((a: Goal, b: Goal) => b.progressPercent - a.progressPercent)

        // 处理洞察数据
        const rawInsights = insightsData.insights ?? []
        const processedInsights: Insight[] = rawInsights.map((insight: {
          id: string
          message: string
          severity: string
          ruleId?: string
        }) => ({
          id: insight.id,
          message: insight.message,
          severity: insight.severity as 'info' | 'warning' | 'success',
          source: insight.ruleId ? '规则引擎' : undefined,
        }))

        // 处理徽章数据
        const rawBadges = badgesData.badges ?? []
        const badgeList: Array<{ id: string; icon: string; name: string }> = rawBadges
          .filter((b: { unlocked: boolean }) => b.unlocked)
          .slice(0, 3)
          .map((b: { id: string; icon: string; name: string }) => ({
            id: b.id,
            icon: b.icon,
            name: b.name,
          }))

        setGoals(processedGoals)
        setHabits(processedHabits)
        setInsights(processedInsights)
        setUnlockedBadges(badgeList)
      } catch (error) {
        console.error('[Dashboard] 加载数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen pb-20 md:pb-4 bg-white/80">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-300 border-t-green-500" />
            <p className="text-sm text-slate-500">加载中...</p>
          </div>
        </div>
      </main>
    )
  }

  // 计算统计指标
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercent, 0) / goals.length)
    : 0

  const totalHabits = habits.length
  const completedTodayCount = habits.filter(h => h.completedToday).length
  const checkinRate = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

  return (
    <main className="min-h-screen pb-20 md:pb-4 animate-fade-in-up bg-white/80">
      {/* 背景图案客户端同步 */}
      <BackgroundApplier />
      {/* 背景装饰层 - 抽象几何 SVG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* 左上角 - 三角形网格 */}
        <div className="absolute -top-10 -left-20 float-medium">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <polygon points="10,10 50,10 30,40" stroke="url(#grad4)" strokeWidth="1.5" />
            <polygon points="60,30 100,30 80,60" stroke="url(#grad4)" strokeWidth="1.5" opacity="0.7" />
            <polygon points="30,70 70,70 50,100" stroke="url(#grad4)" strokeWidth="1.5" opacity="0.5" />
            <polygon points="100,60 140,60 120,90" stroke="url(#grad4)" strokeWidth="1.5" opacity="0.4" />
            <polygon points="70,120 110,120 90,150" stroke="url(#grad4)" strokeWidth="1.5" opacity="0.3" />
          </svg>
        </div>

        {/* 右上角 - 渐变圆环 */}
        <div className="absolute -top-20 -right-20 float-slow">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle cx="150" cy="150" r="100" stroke="url(#grad1)" strokeWidth="20" opacity="0.15" />
            <circle cx="150" cy="150" r="70" stroke="url(#grad1)" strokeWidth="15" opacity="0.1" />
            <circle cx="150" cy="150" r="40" stroke="url(#grad1)" strokeWidth="10" opacity="0.08" />
          </svg>
        </div>

        {/* 左下角 - 波浪线条 */}
        <div className="absolute -bottom-10 -left-10 float-medium">
          <svg width="400" height="200" viewBox="0 0 400 200" fill="none">
            <defs>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#ec4899" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d="M0,100 C100,50 200,150 300,100 C350,75 400,100 400,100" stroke="url(#grad2)" strokeWidth="3" />
            <path d="M0,120 C100,70 200,170 300,120 C350,95 400,120 400,120" stroke="url(#grad2)" strokeWidth="2" opacity="0.7" />
            <path d="M0,140 C100,90 200,190 300,140 C350,115 400,140 400,140" stroke="url(#grad2)" strokeWidth="1.5" opacity="0.5" />
          </svg>
        </div>

        {/* 右下角 - 散点图案 */}
        <div className="absolute -bottom-20 -right-10 float-slow-alt">
          <svg width="250" height="250" viewBox="0 0 250 250" fill="none">
            <defs>
              <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="8" fill="url(#grad3)" />
            <circle cx="120" cy="30" r="5" fill="url(#grad3)" />
            <circle cx="180" cy="60" r="10" fill="url(#grad3)" />
            <circle cx="80" cy="120" r="6" fill="url(#grad3)" />
            <circle cx="200" cy="100" r="4" fill="url(#grad3)" />
            <circle cx="40" cy="180" r="7" fill="url(#grad3)" />
            <circle cx="150" cy="150" r="9" fill="url(#grad3)" />
            <circle cx="220" cy="200" r="5" fill="url(#grad3)" />
          </svg>
        </div>

        {/* 顶部中央 - 渐变光晕 */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full glow-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-4 md:px-6 md:py-6 space-y-4">
        {/* 统计卡片栏 + 成就图标 */}
        <StatsBar
          goalProgress={avgGoalProgress}
          checkinRate={checkinRate}
          streakDays={maxStreak}
          insightCount={insights.length}
          unlockedBadges={unlockedBadges}
        />

        {/* 渐变分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* 洞察区域 */}
        <InsightsSection insights={insights} />

        {/* 渐变分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Goals + Habits 双栏（60:40 比例） */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <GoalsSection goals={goals as any} total={goals.length} />
          <HabitsSection habits={habits} total={habits.length} />
        </div>
      </div>
    </main>
  )
}
