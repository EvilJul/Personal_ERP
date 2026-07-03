import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** POST /api/sync - 触发 Actual Budget 同步（长耗时操作，返回 loading 状态） */
export async function POST() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // TODO: 实际同步逻辑待 Actual Budget 连接实现后补充
    // 预期流程：
    // 1. 读取 settings 中的 Actual Budget 配置
    // 2. 使用 @actual-app/api 连接 Actual Budget 服务器
    // 3. 同步交易数据到本地缓存
    // 4. 解析并生成 insights

    return NextResponse.json({ status: 'started' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
