type StatCardProps = {
  label: string
  value: string
  change?: string
}

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
      <StatCard label="目标进度" value={`${goalProgress}%`} change="+12%" />
      <StatCard label="打卡率" value={`${checkinRate}%`} change="+5%" />
      <StatCard label="连续天数" value={streakDays.toString()} change="最佳记录" />
      <StatCard label="洞察" value={insightCount.toString()} change="1 条新" />
    </div>
  )
}
