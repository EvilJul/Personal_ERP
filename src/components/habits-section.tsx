import { cn } from '@/lib/utils'
import { HabitCard } from '@/components/habit-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type DashboardHabit = {
  id: string
  title: string
  frequency: string
  streak: number
  completedToday: boolean
  recentDays: boolean[]
  completionTrend?: number
}

type HabitsSectionProps = {
  habits: DashboardHabit[]
  /** 数据库中的总习惯数量（habits 可能已被截断） */
  total?: number
  className?: string
}

const DASHBOARD_LIMIT = 3

export function HabitsSection({ habits, total, className }: HabitsSectionProps) {
  const displayHabits = habits.slice(0, DASHBOARD_LIMIT)
  const remaining = (total ?? habits.length) - DASHBOARD_LIMIT

  return (
    <section className={cn('w-full animate-fade-in-up', className)} style={{ animationDelay: '100ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">习惯</h2>
        <Button variant="ghost" size="sm" render={<Link href="/habits" />} nativeButton={false}>
          查看全部
        </Button>
      </div>

      {displayHabits.length === 0 ? (
        <EmptyState
          icon="✅"
          title="开始养成你的第一个习惯"
          description="每日打卡，培养持久的好习惯"
          action={
            <Button size="sm" className="rounded-lg bg-slate-900 text-white hover:bg-slate-700" render={<Link href="/habits" />} nativeButton={false}>
              创建习惯
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {displayHabits.map((habit) => (
            <div key={habit.id} className="stagger-item">
              <HabitCard
                id={habit.id}
                title={habit.title}
                frequency={habit.frequency}
                streak={habit.streak}
                completedToday={habit.completedToday}
                recentDays={habit.recentDays}
                completionTrend={habit.completionTrend}
                className="card-hover"
              />
            </div>
          ))}
          {remaining > 0 && (
            <Link
              href="/habits"
              className="block rounded-lg py-2 text-center text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 link-underline"
            >
              +{remaining} 个更多
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
