'use client'

type BadgeCardProps = {
  id: string
  name: string
  category: string
  icon: string
  description: string | null
  rarity: string
  unlocked: boolean
  currentTier: number
  onClick?: () => void
}

const tierColors: Record<number, string> = {
  0: 'from-slate-300 to-slate-400', // locked
  1: 'from-amber-600 to-amber-800', // copper
  2: 'from-slate-300 to-slate-500', // silver
  3: 'from-yellow-400 to-yellow-600', // gold
  4: 'from-cyan-300 to-blue-400', // diamond
}

const tierNames: Record<number, string> = {
  0: '未解锁',
  1: '铜',
  2: '银',
  3: '金',
  4: '钻石',
}

export function BadgeCard({ name, icon, description, rarity, unlocked, currentTier, onClick }: BadgeCardProps) {
  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${unlocked
          ? 'bg-white border-slate-200 hover:shadow-md hover:-translate-y-0.5'
          : 'bg-slate-50 border-slate-100 opacity-60'
        }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tierColors[currentTier]} flex items-center justify-center text-2xl`}>
          {unlocked ? icon : '🔒'}
        </div>
        <div>
          <div className="font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{unlocked ? tierNames[currentTier] : rarity}</div>
        </div>
      </div>
      {description && (
        <div className="mt-2 text-xs text-slate-600">{description}</div>
      )}
      {unlocked && currentTier < 4 && (
        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${tierColors[currentTier + 1]} rounded-full progress-animate`}
            style={{ width: `${(currentTier / 4) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
