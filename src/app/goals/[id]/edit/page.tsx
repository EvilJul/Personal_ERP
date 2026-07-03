'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { GoalForm } from '@/components/goal-form'

type GoalData = {
  id: string
  title: string
  targetValue: number
  unit?: string
  deadline?: string
}

export default function EditGoalPage() {
  const params = useParams<{ id: string }>()
  const [goal, setGoal] = useState<GoalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadGoal() {
      try {
        const res = await fetch(`/api/goals/${params.id}`)
        if (!res.ok) {
          throw new Error('目标不存在')
        }
        const data = await res.json()
        setGoal(data.goal)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }
    loadGoal()
  }, [params.id])

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-lg px-4 py-6 md:px-6 md:py-8">
        {/* 返回链接 */}
        <div className="mb-6">
          <Link
            href="/goals"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            ← 返回目标列表
          </Link>
        </div>

        {/* 页面标题 */}
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">编辑目标</h1>

        {/* 内容区 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {loading && (
            <p className="text-sm text-slate-500">加载中...</p>
          )}
          {error && (
            <div className="text-center">
              <p className="text-sm text-red-500">{error}</p>
              <Link
                href="/goals"
                className="mt-2 inline-block text-sm text-slate-500 hover:text-slate-700"
              >
                返回目标列表
              </Link>
            </div>
          )}
          {goal && (
            <GoalForm
              mode="edit"
              goalId={goal.id}
              defaultValues={{
                title: goal.title,
                targetValue: goal.targetValue,
                unit: goal.unit,
                deadline: goal.deadline,
              }}
            />
          )}
        </div>
      </div>
    </main>
  )
}
