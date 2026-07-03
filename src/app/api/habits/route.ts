import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { getAllHabits, createHabit } from '@/db/queries/habits'

export const dynamic = 'force-dynamic'

const CreateHabitSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly']).default('daily'),
  linkedGoalId: z.string().optional(),
})

/** GET /api/habits - 获取所有习惯 */
export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const habits = getAllHabits()
    return NextResponse.json({ habits })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/** POST /api/habits - 创建新习惯 */
export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = CreateHabitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const newHabit = createHabit(parsed.data)
    return NextResponse.json({ id: newHabit.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
