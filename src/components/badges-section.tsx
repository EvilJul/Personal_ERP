import { BadgeCard } from './badge-card'
import Link from 'next/link'

type Badge = {
  id: string
  name: string
  category: string
  icon: string
  description: string | null
  rarity: string
  unlocked: boolean
  currentTier: number
}

type BadgesSectionProps = {
  badges: Badge[]
}

export function BadgesSection({ badges }: BadgesSectionProps) {
  const recentBadges = badges
    .filter(b => b.unlocked)
    .slice(0, 3)

  if (recentBadges.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">成就</h2>
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">🏆</div>
          <div>完成目标或打卡习惯解锁成就</div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">成就</h2>
        <Link href="/badges" className="text-sm text-slate-500 hover:text-slate-700">
          查看全部 →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 stagger-item">
        {recentBadges.map(badge => (
          <BadgeCard key={badge.id} {...badge} />
        ))}
      </div>
    </section>
  )
}
