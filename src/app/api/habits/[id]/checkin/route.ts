import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { habitEntries } from '@/db/schema'
import { isAuthenticated } from '@/lib/auth'
import { getHabitById, getHabitEntry, markHabitEntry } from '@/db/queries/habits'
import { evaluateRules } from '@/engine/rules'

export const dynamic = 'force-dynamic'

const CheckinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD'),
})

type RouteParams = { params: Promise<{ id: string }> }

/** POST /api/habits/[id]/checkin - 习惯打卡 toggle（已完成则取消，未完成则打卡） */
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

    // Toggle 逻辑：已打卡 → 删除记录（取消打卡），未打卡 → 创建记录（打卡）
    const existingEntry = getHabitEntry(id, date)
    if (existingEntry) {
      // 已打卡 → 取消打卡（删除记录）
      db.delete(habitEntries)
        .where(eq(habitEntries.id, existingEntry.id))
        .run()
      return NextResponse.json({ entry: null, action: 'unchecked' })
    }

    // 未打卡 → 打卡
    const entry = markHabitEntry(id, date)

    // 异步触发规则评估，不阻塞响应
    evaluateRules('habits').catch((err) =>
      console.error('规则评估失败:', err)
    )

    return NextResponse.json({ entry, action: 'checked' }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
