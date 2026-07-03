import { cn } from '@/lib/utils'
import { GoalCard } from '@/components/goal-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Goal } from '@/db/queries/goals'

type GoalWithTrend = Goal & {
  trend?: number
}

type GoalsSectionProps = {
  goals: GoalWithTrend[]
  className?: string
}

export function GoalsSection({ goals, className }: GoalsSectionProps) {
  return (
    <section className={cn('w-full', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">目标</h2>
        <Button variant="ghost" size="sm" render={<Link href="/goals" />} nativeButton={false}>
          查看全部
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="开始追踪你的第一个目标"
          description="设定目标、记录进度，让每一步都有方向"
          action={
            <Button size="sm" className="rounded-lg bg-slate-900 text-white hover:bg-slate-700" render={<Link href="/goals" />} nativeButton={false}>
              创建目标
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {goals.slice(0, 3).map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              title={goal.title}
              currentValue={goal.currentValue}
              targetValue={goal.targetValue}
              unit={goal.unit ?? undefined}
              deadline={goal.deadline ?? undefined}
              trend={goal.trend}
            />
          ))}
        </div>
      )}
    </section>
  )
}
