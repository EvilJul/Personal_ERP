import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { getGoalById, updateGoal, deleteGoal } from '@/db/queries/goals'

export const dynamic = 'force-dynamic'

const UpdateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  currentValue: z.number().optional(),
  targetValue: z.number().positive().optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

/** GET /api/goals/[id] - 获取单个目标 */
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
    const goal = getGoalById(id)
    if (!goal) {
      return NextResponse.json(
        { error: '目标不存在', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({ goal })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/** PUT /api/goals/[id] - 更新目标 */
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
    const parsed = UpdateGoalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const goal = updateGoal(id, parsed.data)
    if (!goal) {
      return NextResponse.json(
        { error: '目标不存在', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({ goal })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/** DELETE /api/goals/[id] - 删除目标 */
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
    const deleted = deleteGoal(id)
    if (!deleted) {
      return NextResponse.json(
        { error: '目标不存在', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
