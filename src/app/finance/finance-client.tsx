'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountCard } from '@/components/account-card'
import { TransactionTable } from '@/components/transaction-table'

type Account = {
  id: string
  name: string
  type: string
  balance: number
}

type Transaction = {
  id: string
  accountId: string
  amount: number
  date: string
  payee: string | null
  category: string | null
}

type Category = {
  category: string
}

export function FinancePageClient() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [startDate, endDate, selectedCategory])

  async function loadData() {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        fetch('/api/finance/accounts'),
        fetch('/api/finance/categories'),
      ])
      const accountsData = await accountsRes.json()
      const categoriesData = await categoriesRes.json()
      setAccounts(accountsData.accounts ?? [])
      setCategories(categoriesData.categories ?? [])
      await loadTransactions()
    } catch (error) {
      console.error('[FinancePage] 加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTransactions() {
    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (selectedCategory) params.set('category', selectedCategory)

      const res = await fetch(`/api/finance/transactions?${params.toString()}`)
      const data = await res.json()
      setTransactions(data.transactions ?? [])
    } catch (error) {
      console.error('[FinancePage] 加载交易记录失败:', error)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch('/api/sync', { method: 'POST' })
      await loadData()
    } catch (error) {
      console.error('[FinancePage] 同步失败:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-300 border-t-green-500" />
            <p className="text-sm text-slate-500">加载中...</p>
          </div>
        </div>
      </main>
    )
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonth))

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {/* 返回链接 */}
        <div className="mb-4">
          <Link href="/" className="text-sm text-slate-500 transition-colors hover:text-slate-700">
            &larr; 返回首页
          </Link>
        </div>

        {/* 页面头部 */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">财务</h1>
            <p className="mt-1 text-sm text-slate-500">管理你的账户和交易记录</p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {syncing ? '同步中...' : '同步数据'}
          </Button>
        </header>

        {/* 财务概览 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">总余额</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">¥{totalBalance.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">账户数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{accounts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">本月交易</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{monthlyTransactions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* 账户列表 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">账户列表</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
          {accounts.length === 0 && (
            <p className="text-sm text-slate-500">暂无账户数据，请先同步 Actual Budget</p>
          )}
        </section>

        {/* 交易记录 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">交易记录</h2>

          {/* 筛选条件 */}
          <div className="flex gap-3 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">全部类别</option>
              {categories.map(cat => (
                <option key={cat.category} value={cat.category}>{cat.category}</option>
              ))}
            </select>
          </div>

          <TransactionTable transactions={transactions} />
        </section>
      </div>
    </main>
  )
}
