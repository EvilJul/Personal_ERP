'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { HabitForm } from '@/components/habit-form'

type Habit = {
  id: string
  title: string
  frequency: string
  linkedGoalId?: string | null
}

export function HabitEditClient() {
  const params = useParams<{ slug?: string[] }>()
  const [habit, setHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const slug = params.slug ?? []
  const habitId = slug.length >= 2 && slug[1] === 'edit' ? slug[0] : null

  useEffect(() => {
    if (!habitId) {
      setError('无效的习惯 ID')
      setLoading(false)
      return
    }

    async function loadHabit() {
      try {
        const res = await fetch(`/api/habits/${habitId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('习惯不存在')
            return
          }
          throw new Error('加载失败')
        }
        const data = await res.json()
        setHabit(data.habit)
      } catch {
        setError('加载失败，请重试')
      } finally {
        setLoading(false)
      }
    }
    loadHabit()
  }, [habitId])

  if (!habitId) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
          <p className="text-sm text-red-500">无效的 URL</p>
          <Link href="/habits" className="mt-2 inline-block text-sm text-slate-500 hover:text-slate-700">
            返回习惯列表
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6">
          <Link href="/habits" className="text-sm text-slate-500 transition-colors hover:text-slate-700">
            &larr; 返回习惯列表
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">编辑习惯</h1>
          <p className="mt-1 text-sm text-slate-500">修改习惯信息</p>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-green-500" />
          </div>
        )}

        {error && <p className="py-8 text-center text-sm text-red-500">{error}</p>}

        {habit && <HabitForm initialData={habit} />}
      </div>
    </main>
  )
}
