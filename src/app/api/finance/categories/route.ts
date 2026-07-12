import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getTransactionCategories } from '@/db/queries/finance'

/** GET /api/finance/categories - 获取交易类别 */
export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const categories = getTransactionCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `获取交易类别失败: ${message}`, code: 'FETCH_CATEGORIES_ERROR' },
      { status: 500 }
    )
  }
}
