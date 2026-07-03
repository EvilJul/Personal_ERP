import { cn } from '@/lib/utils'
import { InsightCard } from '@/components/insight-card'
import { EmptyState } from '@/components/empty-state'

type DashboardInsight = {
  id: string
  message: string
  severity: 'info' | 'warning' | 'success'
  source?: string
}

type InsightsSectionProps = {
  insights: DashboardInsight[]
  className?: string
}

export function InsightsSection({ insights, className }: InsightsSectionProps) {
  return (
    <section className={cn('w-full animate-fade-in-up', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">洞察</h2>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          icon="💡"
          title="暂无洞察"
          description="先添加目标和习惯，系统会为你生成跨模块的洞察分析"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {insights.map((insight, index) => (
            <div key={insight.id} className="stagger-item">
              <InsightCard
                message={insight.message}
                severity={insight.severity}
                source={insight.source}
                isFirst={index === 0}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
