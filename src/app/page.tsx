import { InsightsSection } from '@/components/insights-section'
import { GoalsSection } from '@/components/goals-section'
import { HabitsSection } from '@/components/habits-section'

export default function DashboardPage() {
  // MVP: 使用静态空数据，后续接入 API
  const insights: never[] = []
  const goals: never[] = []
  const habits: never[] = []

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
