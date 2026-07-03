import Link from 'next/link'

type StatCardProps = {
  label: string
  value: string
  icon: string
  color: 'green' | 'blue' | 'orange' | 'purple' | 'amber'
}

const colorStyles: Record<StatCardProps['color'], { bg: string; iconBg: string; text: string }> = {
  green: { bg: 'bg-green-50/60 hover:bg-green-50', iconBg: 'bg-green-100', text: 'text-green-600' },
  blue: { bg: 'bg-blue-50/60 hover:bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-50/60 hover:bg-orange-50', iconBg: 'bg-orange-100', text: 'text-orange-600' },
  purple: { bg: 'bg-purple-50/60 hover:bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-600' },
  amber: { bg: 'bg-amber-50/60 hover:bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const styles = colorStyles[color]
  return (
    <div className={`stagger-item card-hover flex items-center gap-3 rounded-xl border border-slate-200/80 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] min-h-[72px] ${styles.bg}`}>
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}>
        <span className={`text-lg ${styles.text}`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums leading-tight text-slate-900">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
      </div>
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
        <StatCard label="目标进度" value={`${goalProgress}%`} icon="◎" color="green" />
        <StatCard label="打卡率" value={`${checkinRate}%`} icon="◉" color="blue" />
        <StatCard label="连续天数" value={streakDays.toString()} icon="▲" color="orange" />
        <StatCard label="洞察" value={insightCount.toString()} icon="◆" color="purple" />
        <StatCard label="成就" value={unlockedBadges.length.toString()} icon="★" color="amber" />
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
