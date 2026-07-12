import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllAccounts } from '@/db/queries/finance'

/** GET /api/finance/accounts - 获取所有账户 */
export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const accounts = getAllAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `获取账户失败: ${message}`, code: 'FETCH_ACCOUNTS_ERROR' },
      { status: 500 }
    )
  }
}
