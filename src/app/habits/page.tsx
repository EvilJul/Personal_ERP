'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { HabitCard } from '@/components/habit-card'
import { SearchFilter } from '@/components/search-filter'
import { Pagination } from '@/components/pagination'

type Habit = {
  id: string
  title: string
  frequency: string
  linkedGoalId?: string | null
  createdAt: string
  updatedAt: string
}

const PAGE_SIZE = 20

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('全部')
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function fetchHabits() {
      try {
        const res = await fetch('/api/habits')
        if (!res.ok) {
          throw new Error('加载失败')
        }
        const data = await res.json()
        setHabits(data.habits ?? [])
      } catch {
        setError('加载习惯列表失败，请刷新重试')
      } finally {
        setLoading(false)
      }
    }
    fetchHabits()
  }, [])

  // 根据 filter 和 search 过滤
  const filtered = useMemo(() => {
    let result = habits

    // 状态筛选（由于习惯 API 没有返回 completedToday，这里用 frequency 筛选作示例）
    // 管理页面的筛选基于标题搜索
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((h) => h.title.toLowerCase().includes(q))
    }

    // filter 可以根据实际需要扩展
    // 暂时 '全部' 不做过滤
    if (filter === '进行中') {
      result = result.filter((h) => h.frequency === 'daily')
    } else if (filter === '已完成') {
      // 暂无完成状态，返回空（可以后续扩展）
      result = []
    }

    return result
  }, [habits, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
            <h1 className="text-2xl font-semibold text-slate-900">习惯</h1>
            <p className="mt-1 text-sm text-slate-500">
              养成好习惯，每日打卡
            </p>
          </div>
          <Link href="/habits/new">
            <Button
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              新建习惯
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
          placeholder="搜索习惯..."
        />

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-green-500" />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        )}

        {/* 习惯列表 */}
        {!loading && !error && paged.length === 0 && (
          <EmptyState
            icon={search || filter !== '全部' ? '🔍' : '✅'}
            title={search || filter !== '全部' ? '没有找到匹配的习惯' : '开始养成你的第一个习惯'}
            description={search || filter !== '全部' ? '试试换个关键词或清除筛选条件' : '每日打卡，培养持久的好习惯'}
            action={
              !search && filter === '全部' ? (
                <Link href="/habits/new">
                  <Button size="sm" className="bg-green-500 text-white hover:bg-green-600">
                    创建习惯
                  </Button>
                </Link>
              ) : undefined
            }
          />
        )}

        {!loading && !error && paged.length > 0 && (
          <div className="space-y-3">
            {paged.map((habit) => (
              <div key={habit.id} className="stagger-item">
                <HabitCard
                  id={habit.id}
                  title={habit.title}
                  frequency={habit.frequency}
                  completedToday={false}
                  recentDays={[]}
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
