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

const severityBorder: Record<InsightCardProps['severity'], string> = {
  info: 'border-l-blue-400',
  warning: 'border-l-orange-400',
  success: 'border-l-green-400',
}

const severityBg: Record<InsightCardProps['severity'], string> = {
  info: 'bg-blue-50/40',
  warning: 'bg-orange-50/40',
  success: 'bg-green-50/40',
}

export function InsightCard({ message, severity, source, isFirst, className }: InsightCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-l-[3px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        'border-slate-200',
        severityBorder[severity],
        severityBg[severity],
        isFirst && 'ring-1 ring-green-200',
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
