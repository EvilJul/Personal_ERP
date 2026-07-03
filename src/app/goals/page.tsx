import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { GoalCard } from '@/components/goal-card'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

type Goal = {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit?: string
  deadline?: string
}

async function getGoals(): Promise<Goal[]> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') ?? 'localhost:3000'
    const protocol = headersList.get('x-forwarded-proto') ?? 'http'
    const res = await fetch(`${protocol}://${host}/api/goals`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.goals ?? []
  } catch {
    return []
  }
}

export default async function GoalsPage() {
  const goals = await getGoals()

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
        {/* 页面头部 */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">目标</h1>
            <p className="mt-1 text-sm text-slate-500">
              设定目标，追踪进度
            </p>
          </div>
          <Link href="/goals/new">
            <Button
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              新建目标
            </Button>
          </Link>
        </header>

        {/* 返回链接 */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            ← 返回仪表盘
          </Link>
        </div>

        {/* 目标列表 */}
        {goals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="开始追踪你的第一个目标"
            description="设定目标、记录进度，让每一步都有方向"
            action={
              <Link href="/goals/new">
                <Button
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  创建目标
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                title={goal.title}
                currentValue={goal.currentValue}
                targetValue={goal.targetValue}
                unit={goal.unit}
                deadline={goal.deadline}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
