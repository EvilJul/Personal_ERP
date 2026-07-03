import { cn } from '@/lib/utils'
import { InsightCard } from '@/components/insight-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Insight = {
  id: string
  message: string
  severity: 'info' | 'warning' | 'success'
  source?: string
}

type InsightsSectionProps = {
  insights?: Insight[]
  className?: string
}

export function InsightsSection({ insights = [], className }: InsightsSectionProps) {
  return (
    <section className={cn('w-full', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">洞察</h2>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          icon="💡"
          title="暂无洞察"
          description="先添加目标和习惯，系统会为你生成跨模块的洞察分析"
        />
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              message={insight.message}
              severity={insight.severity}
              source={insight.source}
              isFirst={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  )
}
