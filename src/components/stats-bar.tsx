type StatCardProps = {
  label: string
  value: string
  change?: string
  tint: 'green' | 'blue' | 'orange' | 'purple'
}

const tintStyles: Record<StatCardProps['tint'], string> = {
  green: 'bg-green-50/60 hover:bg-green-50',
  blue: 'bg-blue-50/60 hover:bg-blue-50',
  orange: 'bg-orange-50/60 hover:bg-orange-50',
  purple: 'bg-purple-50/60 hover:bg-purple-50',
}

function StatCard({ label, value, change, tint }: StatCardProps) {
  return (
    <div className={`stagger-item card-hover rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${tintStyles[tint]}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {change && (
        <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
          {change}
        </span>
      )}
    </div>
  )
}

type StatsBarProps = {
  goalProgress: number
  checkinRate: number
  streakDays: number
  insightCount: number
}

export function StatsBar({ goalProgress, checkinRate, streakDays, insightCount }: StatsBarProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="目标进度" value={`${goalProgress}%`} change="+12%" tint="green" />
      <StatCard label="打卡率" value={`${checkinRate}%`} change="+5%" tint="blue" />
      <StatCard label="连续天数" value={streakDays.toString()} change="最佳记录" tint="orange" />
      <StatCard label="洞察" value={insightCount.toString()} change="1 条新" tint="purple" />
    </div>
  )
}
