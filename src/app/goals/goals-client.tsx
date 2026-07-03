'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { GoalCard } from '@/components/goal-card'
import { SearchFilter } from '@/components/search-filter'
import { Pagination } from '@/components/pagination'

type Goal = {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit?: string | null
  deadline?: string | null
}

type GoalsPageClientProps = {
  goals: Goal[]
}

const PAGE_SIZE = 20

export function GoalsPageClient({ goals }: GoalsPageClientProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('全部')
  const [page, setPage] = useState(1)

  // 根据 filter 和 search 过滤
  const filtered = useMemo(() => {
    let result = goals

    // 状态筛选
    if (filter === '进行中') {
      result = result.filter((g) => g.currentValue < g.targetValue)
    } else if (filter === '已完成') {
      result = result.filter((g) => g.currentValue >= g.targetValue)
    }

    // 搜索
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((g) => g.title.toLowerCase().includes(q))
    }

    return result
  }, [goals, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 筛选或搜索变化时重置到第一页
  function handleSearch(q: string) {
    setSearch(q)
    setPage(1)
  }

  function handleFilterChange(f: string) {
    setFilter(f)
    setPage(1)
  }

  return (
    <main className="min-h-screen animate-fade-in-up bg-slate-50 pb-20 md:pb-8">
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
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700 link-underline"
          >
            &larr; 返回仪表盘
          </Link>
        </div>

        {/* 搜索 + 筛选 */}
        <SearchFilter
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          currentFilter={filter}
          placeholder="搜索目标..."
        />

        {/* 目标列表 */}
        {paged.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={search || filter !== '全部' ? '没有找到匹配的目标' : '开始追踪你的第一个目标'}
            description={search || filter !== '全部' ? '试试换个关键词或清除筛选条件' : '设定目标、记录进度，让每一步都有方向'}
            action={
              !search && filter === '全部' ? (
                <Link href="/goals/new">
                  <Button size="sm" className="bg-green-500 text-white hover:bg-green-600">
                    创建目标
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {paged.map((goal) => (
              <div key={goal.id} className="stagger-item">
                <GoalCard
                  id={goal.id}
                  title={goal.title}
                  currentValue={goal.currentValue}
                  targetValue={goal.targetValue}
                  unit={goal.unit ?? undefined}
                  deadline={goal.deadline ?? undefined}
                  className="card-hover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </main>
  )
}
