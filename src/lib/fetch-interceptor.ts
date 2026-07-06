/**
 * 客户端 fetch 拦截器
 *
 * 拦截 /api/* 请求，直接调用 wa-sqlite 浏览器数据库。
 * 在 Capacitor 静态导出模式下替代 Next.js API Routes。
 */

import { nanoid } from 'nanoid'
import { ensureBrowserDb } from '@/db/browser'

// 保存原始 fetch
const originalFetch = globalThis.fetch

let installed = false

/** 安装 fetch 拦截器（幂等） */
export function installFetchInterceptor() {
  if (installed) return
  if (typeof window === 'undefined') return

  installed = true

  globalThis.fetch = async function interceptedFetch(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

    // 只拦截 /api/* 请求
    if (!url.startsWith('/api/')) {
      return originalFetch(input, init)
    }

    const method = (init?.method || 'GET').toUpperCase()
    const pathname = url.split('?')[0]

    try {
      // 等待数据库就绪
      await ensureBrowserDb()

      const handler = matchRoute(method, pathname, init)
      if (handler) {
        const result = await handler
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // 未匹配的路由返回 404
      return new Response(JSON.stringify({ error: '未找到' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('[fetch-interceptor] 错误:', error)
      return new Response(
        JSON.stringify({ error: '服务器内部错误' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }
}

// ====== 路由匹配 ======

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteResult = Promise<Record<string, any>>

function matchRoute(method: string, pathname: string, init?: RequestInit): RouteResult | null {
  const body = () => init?.body ? JSON.parse(init.body as string) : {}

  // ---- Goals ----
  if (pathname === '/api/goals' && method === 'GET') return handleGetGoals()
  if (pathname === '/api/goals' && method === 'POST') return handleCreateGoal(body())
  if (pathname.match(/^\/api\/goals\/([^/]+)$/) && method === 'GET') {
    return handleGetGoal(pathname.split('/').pop()!)
  }
  if (pathname.match(/^\/api\/goals\/([^/]+)$/) && method === 'PUT') {
    return handleUpdateGoal(pathname.split('/').pop()!, body())
  }
  if (pathname.match(/^\/api\/goals\/([^/]+)$/) && method === 'DELETE') {
    return handleDeleteGoal(pathname.split('/').pop()!)
  }

  // ---- Habits ----
  if (pathname === '/api/habits' && method === 'GET') return handleGetHabits()
  if (pathname === '/api/habits' && method === 'POST') return handleCreateHabit(body())
  if (pathname.match(/^\/api\/habits\/([^/]+)$/) && method === 'GET') {
    return handleGetHabit(pathname.split('/').pop()!)
  }
  if (pathname.match(/^\/api\/habits\/([^/]+)$/) && method === 'PUT') {
    return handleUpdateHabit(pathname.split('/').pop()!, body())
  }
  if (pathname.match(/^\/api\/habits\/([^/]+)$/) && method === 'DELETE') {
    return handleDeleteHabit(pathname.split('/').pop()!)
  }
  if (pathname.match(/^\/api\/habits\/([^/]+)\/checkin$/) && method === 'POST') {
    const id = pathname.split('/')[3]
    return handleCheckin(id, body())
  }

  // ---- Settings ----
  if (pathname === '/api/settings' && method === 'GET') return handleGetSettings()
  if (pathname === '/api/settings' && method === 'PUT') return handleUpdateSettings(body())

  // ---- Badges ----
  if (pathname === '/api/badges' && method === 'GET') return handleGetBadges()

  // ---- Insights ----
  if (pathname === '/api/insights' && method === 'GET') return handleGetInsights()

  // ---- Auth ----
  if (pathname === '/api/auth/logout' && method === 'POST') return Promise.resolve({ success: true })

  // ---- Sync ----
  if (pathname === '/api/sync' && method === 'POST') {
    return Promise.resolve({ error: '移动端暂不支持 Actual Budget 同步' })
  }

  return null
}

// ====== Goals 处理 ======

async function handleGetGoals() {
  const rows = await dbAll('SELECT * FROM goals ORDER BY created_at DESC')
  return { goals: rows.map(mapGoal) }
}

async function handleCreateGoal(data: Record<string, unknown>) {
  const id = nanoid()
  const now = Math.floor(Date.now() / 1000)
  await dbRun(
    'INSERT INTO goals (id, title, description, target_value, current_value, unit, deadline, linked_modules, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.title, data.description ?? null, data.targetValue, data.currentValue ?? 0, data.unit ?? null, data.deadline ?? null, data.linkedModules ?? null, now, now]
  )
  return { id }
}

async function handleGetGoal(id: string) {
  const rows = await dbAll('SELECT * FROM goals WHERE id = ?', [id])
  if (rows.length === 0) return { error: '目标不存在' }
  return { goal: mapGoal(rows[0]) }
}

async function handleUpdateGoal(id: string, data: Record<string, unknown>) {
  const now = Math.floor(Date.now() / 1000)
  const fields: string[] = []
  const values: unknown[] = []

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.currentValue !== undefined) { fields.push('current_value = ?'); values.push(data.currentValue) }
  if (data.targetValue !== undefined) { fields.push('target_value = ?'); values.push(data.targetValue) }
  if (data.unit !== undefined) { fields.push('unit = ?'); values.push(data.unit) }
  if (data.deadline !== undefined) { fields.push('deadline = ?'); values.push(data.deadline) }
  if (data.linkedModules !== undefined) { fields.push('linked_modules = ?'); values.push(data.linkedModules) }

  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  await dbRun(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`, values)
  const rows = await dbAll('SELECT * FROM goals WHERE id = ?', [id])
  return { goal: mapGoal(rows[0]) }
}

async function handleDeleteGoal(id: string) {
  await dbRun('DELETE FROM goals WHERE id = ?', [id])
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGoal(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    currentValue: Number(row.current_value),
    targetValue: Number(row.target_value),
    unit: row.unit,
    deadline: row.deadline,
    linkedModules: row.linked_modules,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ====== Habits 处理 ======

async function handleGetHabits() {
  const rows = await dbAll('SELECT * FROM habits ORDER BY created_at DESC')
  return { habits: rows.map(mapHabit) }
}

async function handleCreateHabit(data: Record<string, unknown>) {
  const id = nanoid()
  const now = Math.floor(Date.now() / 1000)
  await dbRun(
    'INSERT INTO habits (id, title, description, frequency, linked_goal_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.title, data.description ?? null, data.frequency ?? 'daily', data.linkedGoalId ?? null, now, now]
  )
  return { id }
}

async function handleGetHabit(id: string) {
  const rows = await dbAll('SELECT * FROM habits WHERE id = ?', [id])
  if (rows.length === 0) return { error: '习惯不存在' }
  return { habit: mapHabit(rows[0]) }
}

async function handleUpdateHabit(id: string, data: Record<string, unknown>) {
  const now = Math.floor(Date.now() / 1000)
  const fields: string[] = []
  const values: unknown[] = []

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.frequency !== undefined) { fields.push('frequency = ?'); values.push(data.frequency) }
  if (data.linkedGoalId !== undefined) { fields.push('linked_goal_id = ?'); values.push(data.linkedGoalId) }

  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  await dbRun(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, values)
  const rows = await dbAll('SELECT * FROM habits WHERE id = ?', [id])
  return { habit: mapHabit(rows[0]) }
}

async function handleDeleteHabit(id: string) {
  await dbRun('DELETE FROM habit_entries WHERE habit_id = ?', [id])
  await dbRun('DELETE FROM habits WHERE id = ?', [id])
  return { success: true }
}

async function handleCheckin(habitId: string, data: Record<string, unknown>) {
  const date = data.date as string

  // Toggle 逻辑
  const existing = await dbAll('SELECT id FROM habit_entries WHERE habit_id = ? AND date = ?', [habitId, date])
  if (existing.length > 0) {
    await dbRun('DELETE FROM habit_entries WHERE id = ?', [existing[0].id])
    return { entry: null, action: 'unchecked' }
  }

  const id = nanoid()
  await dbRun('INSERT INTO habit_entries (id, habit_id, date, completed) VALUES (?, ?, ?, 1)', [id, habitId, date])
  return { entry: { id, habitId, date, completed: 1 }, action: 'checked' }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHabit(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    frequency: row.frequency,
    linkedGoalId: row.linked_goal_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ====== Settings 处理 ======

async function handleGetSettings() {
  const rows = await dbAll('SELECT * FROM users LIMIT 1')
  if (rows.length === 0) {
    const id = nanoid()
    const now = Math.floor(Date.now() / 1000)
    await dbRun('INSERT INTO users (id, created_at, updated_at) VALUES (?, ?, ?)', [id, now, now])
    return {
      settings: {
        id,
        actualServerUrl: null,
        actualPassword: null,
        actualBudgetId: null,
      },
    }
  }
  const s = rows[0]
  return {
    settings: {
      id: s.id,
      actualServerUrl: s.actual_server_url,
      actualPassword: s.actual_password ? '••••••••' : null,
      actualBudgetId: s.actual_budget_id,
    },
  }
}

async function handleUpdateSettings(data: Record<string, unknown>) {
  const rows = await dbAll('SELECT * FROM users LIMIT 1')
  let userId: string

  if (rows.length === 0) {
    userId = nanoid()
    const now = Math.floor(Date.now() / 1000)
    await dbRun('INSERT INTO users (id, created_at, updated_at) VALUES (?, ?, ?)', [userId, now, now])
  } else {
    userId = rows[0].id as string
  }

  const now = Math.floor(Date.now() / 1000)
  const fields: string[] = []
  const values: unknown[] = []

  if (data.actualServerUrl !== undefined) { fields.push('actual_server_url = ?'); values.push(data.actualServerUrl) }
  if (data.actualPassword !== undefined) { fields.push('actual_password = ?'); values.push(data.actualPassword) }
  if (data.actualBudgetId !== undefined) { fields.push('actual_budget_id = ?'); values.push(data.actualBudgetId) }

  fields.push('updated_at = ?')
  values.push(now)
  values.push(userId)

  await dbRun(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)
  const updated = await dbAll('SELECT * FROM users WHERE id = ?', [userId])

  return {
    settings: {
      id: updated[0].id,
      actualServerUrl: updated[0].actual_server_url,
      actualPassword: updated[0].actual_password ? '••••••••' : null,
      actualBudgetId: updated[0].actual_budget_id,
    },
  }
}

// ====== Badges 处理 ======

async function handleGetBadges() {
  const allBadges = await dbAll('SELECT * FROM badges ORDER BY created_at ASC')
  const userBadges = await dbAll("SELECT * FROM user_badges WHERE user_id = 'default'")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userBadgeMap: Record<string, any> = {}
  for (const ub of userBadges) {
    userBadgeMap[ub.badge_id as string] = ub
  }

  const result = allBadges.map((badge: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userBadge = userBadgeMap[badge.id as string] as any
    return {
      id: badge.id,
      name: badge.name,
      category: badge.category,
      condition: badge.condition,
      icon: badge.icon,
      description: badge.description,
      rarity: badge.rarity,
      unlocked: !!userBadge,
      currentTier: userBadge ? Number(userBadge.tier) : 0,
      unlockedAt: userBadge ? userBadge.unlocked_at : null,
    }
  })

  return { badges: result }
}

// ====== Insights 处理 ======

async function handleGetInsights() {
  const rows = await dbAll('SELECT * FROM insights ORDER BY created_at DESC')
  return {
    insights: rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      ruleId: row.rule_id,
      message: row.message,
      severity: row.severity,
      data: row.data,
      read: Number(row.read),
      createdAt: row.created_at,
    })),
  }
}

// ====== 查询辅助函数 ======

async function dbAll(sql: string, params?: unknown[]) {
  const { sqlite3, db } = await ensureBrowserDb()

  if (params && params.length > 0) {
    const result = await sqlite3.execWithParams(db, sql, params as (string | number | null)[])
    return result.rows.map((row: (string | number | null)[]) => {
      const obj: Record<string, unknown> = {}
      result.columns.forEach((col: string, i: number) => {
        obj[col] = row[i]
      })
      return obj
    })
  }

  const results: Record<string, unknown>[] = []
  await sqlite3.exec(db, sql, (row: (string | number | null)[], columns: string[]) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    results.push(obj)
  })
  return results
}

async function dbRun(sql: string, params?: unknown[]) {
  const { sqlite3, db } = await ensureBrowserDb()
  if (params && params.length > 0) {
    return await sqlite3.run(db, sql, params as (string | number | null)[])
  }
  return await sqlite3.run(db, sql)
}
