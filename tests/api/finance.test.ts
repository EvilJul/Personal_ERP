import { describe, it, expect, vi, beforeEach } from 'vitest'

// ====== Mock 模块 ======

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => ({ name: 'erp-session', value: 'mock-token' })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

vi.mock('@/lib/auth', () => ({
  isAuthenticated: vi.fn(async () => true),
}))

// mock finance query - 使用可控制的 mock 数据
const mockAccounts: Record<string, unknown>[] = [
  { id: 'acc-1', name: '测试储蓄账户', type: 'savings', balance: 50000, syncId: 'sync-1' },
  { id: 'acc-2', name: '测试信用卡', type: 'credit', balance: -2000, syncId: 'sync-2' },
]

const mockTransactions: Record<string, unknown>[] = [
  { id: 'tx-1', accountId: 'acc-1', amount: -150, date: '2026-07-10', payee: '超市', category: '餐饮', syncId: 'sync-tx-1' },
  { id: 'tx-2', accountId: 'acc-2', amount: -3000, date: '2026-07-05', payee: '房租', category: '住房', syncId: 'sync-tx-2' },
  { id: 'tx-3', accountId: 'acc-1', amount: 8000, date: '2026-06-28', payee: '工资', category: '收入', syncId: 'sync-tx-3' },
]

const mockCategories = ['餐饮', '住房', '收入']

vi.mock('@/db/queries/finance', () => ({
  getAllAccounts: vi.fn(() => mockAccounts),
  getTransactionsByDateRange: vi.fn((startDate: string, endDate: string) => {
    return mockTransactions.filter((t: Record<string, unknown>) => (t.date as string) >= startDate && (t.date as string) <= endDate)
  }),
  getTransactionsByCategory: vi.fn((category: string) => {
    return mockTransactions.filter((t: Record<string, unknown>) => t.category === category)
  }),
  getTransactionCategories: vi.fn(() => mockCategories),
}))

// ====== 导入被测模块 ======
import { GET as GET_ACCOUNTS } from '@/app/api/finance/accounts/route'
import { GET as GET_TRANSACTIONS } from '@/app/api/finance/transactions/route'
import { GET as GET_CATEGORIES } from '@/app/api/finance/categories/route'
import { isAuthenticated } from '@/lib/auth'
import {
  getAllAccounts,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  getTransactionCategories,
} from '@/db/queries/finance'

function createRequest(url: string): Request {
  return new Request(url)
}

describe('Finance API', () => {
  beforeEach(() => {
    vi.mocked(isAuthenticated).mockResolvedValue(true)
    vi.mocked(getAllAccounts).mockReturnValue(mockAccounts as never[])
    vi.mocked(getTransactionsByDateRange).mockImplementation((startDate: string, endDate: string) => {
      return mockTransactions.filter((t: Record<string, unknown>) => (t.date as string) >= startDate && (t.date as string) <= endDate) as never[]
    })
    vi.mocked(getTransactionsByCategory).mockImplementation((category: string) => {
      return mockTransactions.filter((t: Record<string, unknown>) => t.category === category) as never[]
    })
    vi.mocked(getTransactionCategories).mockReturnValue(mockCategories)
  })

  // ====== GET /api/finance/accounts ======
  describe('GET /api/finance/accounts', () => {
    it('返回 200 和账户列表', async () => {
      const res = await GET_ACCOUNTS()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('accounts')
      expect(Array.isArray(body.accounts)).toBe(true)
      expect(body.accounts.length).toBe(2)
    })

    it('账户数据包含必要字段', async () => {
      const res = await GET_ACCOUNTS()
      const body = await res.json()
      const account = body.accounts[0]
      expect(account).toHaveProperty('id')
      expect(account).toHaveProperty('name')
      expect(account).toHaveProperty('type')
      expect(account).toHaveProperty('balance')
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const res = await GET_ACCOUNTS()
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.code).toBe('UNAUTHORIZED')
    })
  })

  // ====== GET /api/finance/transactions ======
  describe('GET /api/finance/transactions', () => {
    it('无参数时返回最近 30 天交易', async () => {
      const req = createRequest('http://localhost/api/finance/transactions')
      const res = await GET_TRANSACTIONS(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('transactions')
      expect(Array.isArray(body.transactions)).toBe(true)
      // 验证调用了 getTransactionsByDateRange
      expect(getTransactionsByDateRange).toHaveBeenCalled()
    })

    it('指定日期范围时按日期筛选', async () => {
      const req = createRequest('http://localhost/api/finance/transactions?startDate=2026-07-01&endDate=2026-07-10')
      const res = await GET_TRANSACTIONS(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(getTransactionsByDateRange).toHaveBeenCalledWith('2026-07-01', '2026-07-10')
      expect(body.transactions.length).toBe(2)
    })

    it('指定类别时按类别筛选', async () => {
      const req = createRequest('http://localhost/api/finance/transactions?category=餐饮')
      const res = await GET_TRANSACTIONS(req)
      expect(res.status).toBe(200)
      expect(getTransactionsByCategory).toHaveBeenCalledWith('餐饮')
      const body = await res.json()
      expect(body.transactions.length).toBe(1)
      expect(body.transactions[0].category).toBe('餐饮')
    })

    it('类别筛选优先于日期筛选', async () => {
      const req = createRequest('http://localhost/api/finance/transactions?startDate=2026-07-01&endDate=2026-07-10&category=住房')
      const res = await GET_TRANSACTIONS(req)
      expect(res.status).toBe(200)
      // 当 category 存在时，应调用 getTransactionsByCategory 而非 getTransactionsByDateRange
      expect(getTransactionsByCategory).toHaveBeenCalledWith('住房')
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest('http://localhost/api/finance/transactions')
      const res = await GET_TRANSACTIONS(req)
      expect(res.status).toBe(401)
    })
  })

  // ====== GET /api/finance/categories ======
  describe('GET /api/finance/categories', () => {
    it('返回 200 和类别列表', async () => {
      const res = await GET_CATEGORIES()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('categories')
      expect(Array.isArray(body.categories)).toBe(true)
      expect(body.categories).toEqual(['餐饮', '住房', '收入'])
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const res = await GET_CATEGORIES()
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.code).toBe('UNAUTHORIZED')
    })
  })
})
