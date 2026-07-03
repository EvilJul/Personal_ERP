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
}

type HabitsSectionProps = {
  habits: DashboardHabit[]
  className?: string
}

export function HabitsSection({ habits, className }: HabitsSectionProps) {
  return (
    <section className={cn('w-full', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">习惯</h2>
        <Button variant="ghost" size="sm" render={<Link href="/habits" />} nativeButton={false}>
          查看全部
        </Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon="✅"
          title="开始养成你的第一个习惯"
          description="每日打卡，培养持久的好习惯"
          action={
            <Button size="sm" className="bg-green-500 text-white hover:bg-green-600" render={<Link href="/habits" />} nativeButton={false}>
              创建习惯
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              title={habit.title}
              frequency={habit.frequency}
              streak={habit.streak}
              completedToday={habit.completedToday}
              recentDays={habit.recentDays}
            />
          ))}
        </div>
      )}
    </section>
  )
}
