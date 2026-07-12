'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '洞察', emoji: '📊' },
  { href: '/goals', label: '目标', emoji: '🎯' },
  { href: '/habits', label: '习惯', emoji: '☑' },
  { href: '/finance', label: '财务', emoji: '💰' },
] as const

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white md:hidden">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
                isActive ? 'text-green-600' : 'text-slate-500'
              )}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
