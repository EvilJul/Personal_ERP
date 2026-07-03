'use client'

import { useEffect, useState } from 'react'
import { BadgeCard } from '@/components/badge-card'
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

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/badges')
      .then(res => res.json())
      .then(data => setBadges(data.badges || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? badges
    : badges.filter(b => b.category === filter)

  const unlocked = badges.filter(b => b.unlocked).length

  return (
    <main className="min-h-screen pb-20 md:pb-8 animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">成就</h1>
            <p className="text-sm text-slate-500">已解锁 {unlocked}/{badges.length}</p>
          </div>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← 返回</Link>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'goal', 'habit', 'finance', 'special'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? '全部' : cat === 'goal' ? '目标' : cat === 'habit' ? '习惯' : cat === 'finance' ? '财务' : '特殊'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">加载中...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(badge => (
              <div key={badge.id} className="stagger-item">
                <BadgeCard {...badge} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
