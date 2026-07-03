import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <span className="mb-4 text-4xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
