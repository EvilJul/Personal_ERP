import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getTransactionsByDateRange, getTransactionsByCategory } from '@/db/queries/finance'

/** GET /api/finance/transactions - 获取交易记录（支持筛选） */
export async function GET(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const category = searchParams.get('category')

    let transactions
    if (category) {
      transactions = getTransactionsByCategory(category)
    } else if (startDate && endDate) {
      transactions = getTransactionsByDateRange(startDate, endDate)
    } else {
      // 默认返回最近 30 天
      const end = new Date().toISOString().split('T')[0]
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      transactions = getTransactionsByDateRange(start, end)
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `获取交易记录失败: ${message}`, code: 'FETCH_TRANSACTIONS_ERROR' },
      { status: 500 }
    )
  }
}
