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
  /** 数据库中的总目标数量（goals 可能已被截断） */
  total?: number
  className?: string
}

const DASHBOARD_LIMIT = 3

export function GoalsSection({ goals, total, className }: GoalsSectionProps) {
  const displayGoals = goals.slice(0, DASHBOARD_LIMIT)
  const remaining = (total ?? goals.length) - DASHBOARD_LIMIT

  return (
    <section className={cn('w-full animate-fade-in-up', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">目标</h2>
        <Button variant="ghost" size="sm" render={<Link href="/goals" />} nativeButton={false}>
          查看全部
        </Button>
      </div>

      {displayGoals.length === 0 ? (
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
          {displayGoals.map((goal) => (
            <div key={goal.id} className="stagger-item">
              <GoalCard
                id={goal.id}
                title={goal.title}
                currentValue={goal.currentValue}
                targetValue={goal.targetValue}
                unit={goal.unit ?? undefined}
                deadline={goal.deadline ?? undefined}
                trend={goal.trend}
                className="card-hover"
              />
            </div>
          ))}
          {remaining > 0 && (
            <Link
              href="/goals"
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
