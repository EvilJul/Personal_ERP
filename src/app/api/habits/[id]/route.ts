import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { getHabitById, updateHabit, deleteHabit } from '@/db/queries/habits'
import { evaluateRules } from '@/engine/rules'

export const dynamic = 'force-dynamic'

const UpdateHabitSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  frequency: z.string().optional(),
  linkedGoalId: z.string().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

/** GET /api/habits/[id] - 获取单个习惯 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { id } = await params
    const habit = getHabitById(id)
    if (!habit) {
      return NextResponse.json(
        { error: '习惯不存在', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({ habit })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/** PUT /api/habits/[id] - 更新习惯 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const parsed = UpdateHabitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const habit = updateHabit(id, parsed.data)
    if (!habit) {
      return NextResponse.json(
        { error: '习惯不存在', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({ habit })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/** DELETE /api/habits/[id] - 删除习惯 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { id } = await params
    const deleted = deleteHabit(id)
    if (!deleted) {
      return NextResponse.json(
        { error: '习惯不存在', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    evaluateRules('habits').catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
