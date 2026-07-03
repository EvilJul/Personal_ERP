import Link from 'next/link'
import { GoalForm } from '@/components/goal-form'

export default function NewGoalPage() {
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
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">新建目标</h1>

        {/* 表单卡片 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <GoalForm mode="create" />
        </div>
      </div>
    </main>
  )
}
