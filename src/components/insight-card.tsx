import { cn } from '@/lib/utils'

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

const severityStyles: Record<InsightCardProps['severity'], { border: string; bg: string; iconBg: string; iconText: string; badgeBg: string; badgeText: string }> = {
  info: {
    border: 'border-l-blue-400',
    bg: 'bg-blue-50/40',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  warning: {
    border: 'border-l-orange-400',
    bg: 'bg-orange-50/40',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
  },
  success: {
    border: 'border-l-green-400',
    bg: 'bg-green-50/40',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
  },
}

const severityIcons: Record<InsightCardProps['severity'], string> = {
  info: '💡',
  warning: '⚠️',
  success: '✅',
}

export function InsightCard({ message, severity, source, isFirst, className }: InsightCardProps) {
  const styles = severityStyles[severity]
  return (
    <div
      className={cn(
        'card-hover rounded-xl border border-l-[3px] p-4 bg-gradient-to-r from-white to-slate-50 shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        'border-slate-200',
        styles.border,
        styles.bg,
        isFirst && 'ring-1 ring-green-200',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', styles.iconBg)}>
          <span className={cn('text-sm', styles.iconText)}>{severityIcons[severity]}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', styles.badgeBg, styles.badgeText)}>
              {severityLabel[severity]}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-900">{message}</p>
          {source && (
            <p className="mt-1 text-xs text-slate-500">来源: {source}</p>
          )}
        </div>
      </div>
    </div>
  )
}
