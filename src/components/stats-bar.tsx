import Link from 'next/link'
import type { ReactNode } from 'react'

// 像素艺术风格 SVG 图标

/** 靶心图标 — 目标进度 */
function TargetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" fill="#22c55e" />
      <rect x="5" y="5" width="6" height="6" fill="white" />
      <rect x="6" y="6" width="4" height="4" fill="#22c55e" />
    </svg>
  )
}

/** 勾选图标 — 打卡率 */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="#3b82f6" strokeWidth="2" fill="none" />
      <rect x="4" y="7" width="2" height="4" fill="#3b82f6" />
      <rect x="6" y="9" width="2" height="2" fill="#3b82f6" />
      <rect x="8" y="7" width="2" height="2" fill="#3b82f6" />
      <rect x="10" y="5" width="2" height="2" fill="#3b82f6" />
    </svg>
  )
}

/** 火焰图标 — 连续天数 */
function FireIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="4" height="2" fill="#f97316" />
      <rect x="4" y="4" width="8" height="2" fill="#f97316" />
      <rect x="4" y="6" width="8" height="2" fill="#ea580c" />
      <rect x="6" y="8" width="4" height="2" fill="#ea580c" />
      <rect x="5" y="4" width="2" height="2" fill="#fbbf24" />
      <rect x="6" y="10" width="4" height="4" fill="#c2410c" />
    </svg>
  )
}

/** 灯泡图标 — 洞察 */
function LightbulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="4" height="2" fill="#9333ea" />
      <rect x="4" y="4" width="8" height="2" fill="#9333ea" />
      <rect x="4" y="6" width="8" height="2" fill="#a855f7" />
      <rect x="5" y="5" width="2" height="2" fill="#e9d5ff" />
      <rect x="6" y="8" width="4" height="2" fill="#e9d5ff" />
      <rect x="6" y="10" width="4" height="2" fill="#64748b" />
      <rect x="4" y="12" width="8" height="2" fill="#64748b" />
    </svg>
  )
}

/** 星星图标 — 成就 */
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="7" y="2" width="2" height="2" fill="#f59e0b" />
      <rect x="5" y="4" width="6" height="2" fill="#f59e0b" />
      <rect x="3" y="6" width="10" height="2" fill="#f59e0b" />
      <rect x="6" y="5" width="4" height="2" fill="#fbbf24" />
      <rect x="4" y="8" width="8" height="2" fill="#f59e0b" />
      <rect x="5" y="10" width="2" height="2" fill="#f59e0b" />
      <rect x="9" y="10" width="2" height="2" fill="#f59e0b" />
      <rect x="4" y="12" width="2" height="2" fill="#f59e0b" />
      <rect x="10" y="12" width="2" height="2" fill="#f59e0b" />
    </svg>
  )
}

type StatCardProps = {
  label: string
  value: string
  icon: ReactNode
  color: 'green' | 'blue' | 'orange' | 'purple' | 'amber'
}

const colorStyles: Record<StatCardProps['color'], { bg: string; iconBg: string }> = {
  green: { bg: 'bg-green-50/60 hover:bg-green-50', iconBg: 'bg-green-100' },
  blue: { bg: 'bg-blue-50/60 hover:bg-blue-50', iconBg: 'bg-blue-100' },
  orange: { bg: 'bg-orange-50/60 hover:bg-orange-50', iconBg: 'bg-orange-100' },
  purple: { bg: 'bg-purple-50/60 hover:bg-purple-50', iconBg: 'bg-purple-100' },
  amber: { bg: 'bg-amber-50/60 hover:bg-amber-50', iconBg: 'bg-amber-100' },
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const styles = colorStyles[color]
  return (
    <div className={`stagger-item card-hover flex items-center gap-3 rounded-xl border border-slate-200/80 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] min-h-[72px] ${styles.bg}`}>
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}>
        {icon}
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
        <StatCard label="目标进度" value={`${goalProgress}%`} icon={<TargetIcon />} color="green" />
        <StatCard label="打卡率" value={`${checkinRate}%`} icon={<CheckIcon />} color="blue" />
        <StatCard label="连续天数" value={streakDays.toString()} icon={<FireIcon />} color="orange" />
        <StatCard label="洞察" value={insightCount.toString()} icon={<LightbulbIcon />} color="purple" />
        <StatCard label="成就" value={unlockedBadges.length.toString()} icon={<StarIcon />} color="amber" />
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
