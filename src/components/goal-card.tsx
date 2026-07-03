import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'

type GoalCardProps = {
  title: string
  currentValue: number
  targetValue: number
  unit?: string
  deadline?: string
  className?: string
}

function formatProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今天截止'
  if (diffDays <= 7) return `${diffDays} 天后`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function GoalCard({ title, currentValue, targetValue, unit, deadline, className }: GoalCardProps) {
  const progress = formatProgress(currentValue, targetValue)

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-900">{title}</h4>
        {deadline && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            {formatDeadline(deadline)}
          </Badge>
        )}
      </div>

      <div className="mt-3">
        <Progress value={progress}>
          <ProgressLabel className="text-xs text-slate-500">
            {currentValue}{unit ? ` ${unit}` : ''} / {targetValue}{unit ? ` ${unit}` : ''}
          </ProgressLabel>
          <ProgressValue className="text-xs font-medium text-slate-700" />
        </Progress>
      </div>
    </div>
  )
}
