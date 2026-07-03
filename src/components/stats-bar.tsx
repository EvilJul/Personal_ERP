import Link from 'next/link'

type StatCardProps = {
  label: string
  value: string
  tint: 'green' | 'blue' | 'orange' | 'purple'
}

const tintStyles: Record<StatCardProps['tint'], string> = {
  green: 'bg-green-50/60 hover:bg-green-50',
  blue: 'bg-blue-50/60 hover:bg-blue-50',
  orange: 'bg-orange-50/60 hover:bg-orange-50',
  purple: 'bg-purple-50/60 hover:bg-purple-50',
}

function StatCard({ label, value, tint }: StatCardProps) {
  return (
    <div className={`stagger-item card-hover flex flex-col items-center justify-center rounded-xl border border-slate-200/80 px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[image:repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_11px)] ${tintStyles[tint]}`}>
      <p className="text-base font-bold text-slate-900 leading-tight">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium text-slate-500 leading-tight">{label}</p>
    </div>
  )
}

type BadgePreview = {
  id: string
  icon: string
  name: string
}

type StatsBarProps = {
  goalProgress: number
  checkinRate: number
  streakDays: number
  insightCount: number
  unlockedBadges: BadgePreview[]
}

export function StatsBar({ goalProgress, checkinRate, streakDays, insightCount, unlockedBadges }: StatsBarProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {/* 5 个统计卡片，等分宽度 */}
      <div className="grid flex-1 grid-cols-5 gap-3">
        <StatCard label="目标进度" value={`${goalProgress}%`} tint="green" />
        <StatCard label="打卡率" value={`${checkinRate}%`} tint="blue" />
        <StatCard label="连续天数" value={streakDays.toString()} tint="orange" />
        <StatCard label="洞察" value={insightCount.toString()} tint="purple" />
        <StatCard label="成就" value={unlockedBadges.length.toString()} tint="green" />
      </div>

      {/* 最近解锁徽章小图标 */}
      {unlockedBadges.length > 0 && (
        <Link
          href="/badges"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-slate-50"
          title="查看全部成就"
        >
          {unlockedBadges.map(badge => (
            <span key={badge.id} className="text-base" title={badge.name}>
              {badge.icon}
            </span>
          ))}
          <span className="ml-1 text-xs text-slate-400">&rarr;</span>
        </Link>
      )}
    </div>
  )
}
