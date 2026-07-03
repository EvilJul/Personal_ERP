import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type InsightCardProps = {
  message: string
  severity: 'info' | 'warning' | 'success'
  source?: string
  isFirst?: boolean
  className?: string
}

const severityLabel: Record<InsightCardProps['severity'], string> = {
  info: '信息',
  warning: '提醒',
  success: '进展',
}

export function InsightCard({ message, severity, source, isFirst, className }: InsightCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors',
        isFirst ? 'border-l-[3px] border-l-green-500 bg-green-50/50' : 'border-slate-200 bg-white',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Badge
          variant={severity === 'warning' ? 'destructive' : severity === 'success' ? 'default' : 'secondary'}
          className="mt-0.5 shrink-0"
        >
          {severityLabel[severity]}
        </Badge>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-900">{message}</p>
          {source && (
            <p className="mt-1 text-xs text-slate-500">来源: {source}</p>
          )}
        </div>
      </div>
    </div>
  )
}
