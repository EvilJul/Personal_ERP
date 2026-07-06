import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllInsights } from '@/db/queries/insights'


/** GET /api/insights - 获取洞察列表 */
export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const insights = getAllInsights()
    return NextResponse.json({ insights })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
