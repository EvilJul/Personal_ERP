import Link from 'next/link'
import { HabitForm } from '@/components/habit-form'

export default function NewHabitPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
        {/* 页面头部 */}
        <header className="mb-6">
          <Link
            href="/habits"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            ← 返回习惯列表
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">新建习惯</h1>
          <p className="mt-1 text-sm text-slate-500">
            设定一个新的日常习惯，开始打卡
          </p>
        </header>

        <HabitForm />
      </div>
    </main>
  )
}
