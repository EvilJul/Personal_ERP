import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { getAllGoals, createGoal } from '@/db/queries/goals'

export const dynamic = 'force-dynamic'

const CreateGoalSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  targetValue: z.number().positive(),
  currentValue: z.number().optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
  linkedModules: z.array(z.string()).optional().transform(
    (val) => val ? JSON.stringify(val) : undefined
  ),
})

/** GET /api/goals - 获取所有目标 */
export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const goals = getAllGoals()
    return NextResponse.json({ goals })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/** POST /api/goals - 创建新目标 */
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
    const parsed = CreateGoalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const newGoal = createGoal(parsed.data)
    return NextResponse.json({ id: newGoal.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
