import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { HabitCard } from '@/components/habit-card'

export default function HabitsPage() {
  // MVP: 使用静态空数据，后续接入 API
  const habits: never[] = []

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
          <Button
            size="sm"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            新建习惯
          </Button>
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

        {/* 习惯列表 */}
        {habits.length === 0 ? (
          <EmptyState
            icon="✅"
            title="开始养成你的第一个习惯"
            description="每日打卡，培养持久的好习惯"
            action={
              <Button
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                创建习惯
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {habits.map((habit: any) => (
              <HabitCard
                key={habit.id}
                title={habit.title}
                streak={habit.streak}
                completedToday={habit.completedToday}
                recentDays={habit.recentDays}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
