import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllBadgesWithUserStatus } from '@/db/queries/badges'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: '未授权', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    const badges = getAllBadgesWithUserStatus()
    return NextResponse.json({ badges })
  } catch (error) {
    return NextResponse.json({ error: '服务器内部错误', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
