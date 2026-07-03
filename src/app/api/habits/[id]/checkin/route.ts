import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { getHabitById, getHabitEntry, markHabitEntry } from '@/db/queries/habits'
import { evaluateRules } from '@/engine/rules'

export const dynamic = 'force-dynamic'

const CheckinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD'),
})

type RouteParams = { params: Promise<{ id: string }> }

/** POST /api/habits/[id]/checkin - 习惯打卡（幂等） */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 验证习惯是否存在
    const habit = getHabitById(id)
    if (!habit) {
      return NextResponse.json(
        { error: '习惯不存在', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = CheckinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const { date } = parsed.data

    // 幂等检查：同一天重复打卡返回已有记录，不创建新记录
    const existingEntry = getHabitEntry(id, date)
    if (existingEntry) {
      return NextResponse.json({ entry: existingEntry })
    }

    const entry = markHabitEntry(id, date)

    // 异步触发规则评估，不阻塞响应
    evaluateRules('habits').catch((err) =>
      console.error('规则评估失败:', err)
    )

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
