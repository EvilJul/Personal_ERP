import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const UpdateSettingsSchema = z.object({
  actualServerUrl: z.string().url().optional().nullable(),
  actualPassword: z.string().optional().nullable(),
  actualBudgetId: z.string().optional().nullable(),
})

/**
 * 脱敏：将 actualPassword 替换为掩码，防止明文泄露给客户端
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeSettings(settings: Record<string, any>) {
  return {
    ...settings,
    actualPassword: settings.actualPassword ? '••••••••' : null,
  }
}

/**
 * 获取或创建唯一的用户设置记录
 * 单用户应用，始终使用同一行记录
 */
function getOrCreateSettings() {
  const existing = db.select().from(users).get()
  if (existing) {
    return existing
  }
  return db.insert(users).values({}).returning().get()
}

/** GET /api/settings - 获取用户设置 */
export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const settings = getOrCreateSettings()
    return NextResponse.json({ settings: sanitizeSettings(settings) })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/** PUT /api/settings - 更新用户设置 */
export async function PUT(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = UpdateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const currentSettings = getOrCreateSettings()
    const updated = db.update(users)
      .set(parsed.data)
      .where(eq(users.id, currentSettings.id))
      .returning()
      .get()

    return NextResponse.json({ settings: sanitizeSettings(updated) })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
