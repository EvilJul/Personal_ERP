import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { db } from '@/db'
import { insights } from '@/db/schema'

export const dynamic = 'force-dynamic'

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

    const allInsights = db.select().from(insights).all()
    return NextResponse.json({ insights: allInsights })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
