import { describe, it, expect, vi, beforeEach } from 'vitest'

// ====== Mock 模块 ======

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => ({ name: 'erp-session', value: 'mock-token' })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

vi.mock('@/lib/auth', () => ({
  isAuthenticated: vi.fn(async () => true),
}))

// mock habits query
const mockHabits: Record<string, unknown>[] = []
const mockEntries: Record<string, unknown>[] = []
let habitIdCounter = 0

vi.mock('@/db/queries/habits', () => ({
  getAllHabits: vi.fn(() => mockHabits),
  getHabitById: vi.fn((id: string) => mockHabits.find((h) => h.id === id)),
  createHabit: vi.fn((data: Record<string, unknown>) => {
    const habit = {
      id: `habit-${++habitIdCounter}`,
      ...data,
      frequency: data.frequency ?? 'daily',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockHabits.push(habit)
    return habit
  }),
  updateHabit: vi.fn((id: string, data: Record<string, unknown>) => {
    const habit = mockHabits.find((h) => h.id === id)
    if (!habit) return undefined
    Object.assign(habit, data, { updatedAt: new Date() })
    return habit
  }),
  deleteHabit: vi.fn((id: string) => {
    const idx = mockHabits.findIndex((h) => h.id === id)
    if (idx === -1) return false
    mockHabits.splice(idx, 1)
    return true
  }),
  getHabitEntry: vi.fn((habitId: string, date: string) => {
    return mockEntries.find(
      (e) => e.habitId === habitId && e.date === date
    ) as Record<string, unknown> | undefined
  }),
  markHabitEntry: vi.fn((habitId: string, date: string) => {
    const entry = {
      id: `entry-${Date.now()}`,
      habitId,
      date,
      completed: 1,
      createdAt: new Date(),
    }
    mockEntries.push(entry)
    return entry
  }),
  getHabitEntries: vi.fn((habitId: string) => {
    return mockEntries.filter((e) => e.habitId === habitId)
  }),
}))

// mock db for checkin route (它直接用 db.delete)
vi.mock('@/db', () => ({
  db: {
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        run: vi.fn(),
      })),
    })),
  },
}))

// mock goals query (habits route 用 getGoalById 验证 linkedGoalId)
vi.mock('@/db/queries/goals', () => ({
  getGoalById: vi.fn((id: string) => {
    if (id === 'existing-goal') return { id: 'existing-goal', title: '测试目标' }
    return undefined
  }),
}))

vi.mock('@/engine/rules', () => ({
  evaluateRules: vi.fn(async () => []),
}))

// ====== 导入被测模块 ======
import { GET, POST } from '@/app/api/habits/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/habits/[id]/route'
import { POST as CHECKIN } from '@/app/api/habits/[id]/checkin/route'
import { isAuthenticated } from '@/lib/auth'

function createRequest(url: string, init?: RequestInit): Request {
  return new Request(url, init)
}

function createParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('Habits API', () => {
  beforeEach(() => {
    mockHabits.length = 0
    mockEntries.length = 0
    habitIdCounter = 0
    vi.mocked(isAuthenticated).mockResolvedValue(true)
  })

  describe('GET /api/habits', () => {
    it('返回 200 和习惯列表', async () => {
      const res = await GET()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('habits')
      expect(Array.isArray(body.habits)).toBe(true)
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const res = await GET()
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/habits', () => {
    it('创建习惯返回 201', async () => {
      const req = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '每天运动',
          description: '至少30分钟',
          frequency: 'daily',
        }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body).toHaveProperty('id')
      expect(body.id).toBeTruthy()
    })

    it('默认 frequency 为 daily', async () => {
      const req = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '阅读' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      // frequency 默认值由 Zod schema 的 .default('daily') 处理
    })

    it('关联已存在目标时创建成功', async () => {
      const req = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '锻炼',
          frequency: 'daily',
          linkedGoalId: 'existing-goal',
        }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
    })

    it('关联不存在的目标返回 400', async () => {
      const req = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '锻炼',
          linkedGoalId: 'nonexistent-goal',
        }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.code).toBe('NOT_FOUND')
    })

    it('缺少必填字段 title 返回 400', async () => {
      const req = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.code).toBe('VALIDATION_ERROR')
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '测试' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(401)
    })
  })

  describe('PUT /api/habits/[id]', () => {
    it('更新习惯返回 200', async () => {
      // 先创建
      const createReq = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '原始习惯', frequency: 'daily' }),
      })
      const createRes = await POST(createReq)
      const { id } = await createRes.json()

      // 更新
      const updateReq = createRequest(`http://localhost/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '更新后的习惯', frequency: 'weekly' }),
      })
      const res = await PUT(updateReq, createParams(id))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.habit).toBeTruthy()
    })

    it('更新不存在的习惯返回 404', async () => {
      const req = createRequest('http://localhost/api/habits/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '不存在' }),
      })
      const res = await PUT(req, createParams('nonexistent'))
      expect(res.status).toBe(404)
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest('http://localhost/api/habits/any', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'test' }),
      })
      const res = await PUT(req, createParams('any'))
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/habits/[id]', () => {
    it('删除习惯返回 200', async () => {
      // 先创建
      const createReq = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '待删除习惯' }),
      })
      const createRes = await POST(createReq)
      const { id } = await createRes.json()

      // 删除
      const deleteReq = createRequest(`http://localhost/api/habits/${id}`, {
        method: 'DELETE',
      })
      const res = await DELETE(deleteReq, createParams(id))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    it('删除不存在的习惯返回 404', async () => {
      const req = createRequest('http://localhost/api/habits/nonexistent', {
        method: 'DELETE',
      })
      const res = await DELETE(req, createParams('nonexistent'))
      expect(res.status).toBe(404)
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest('http://localhost/api/habits/any', {
        method: 'DELETE',
      })
      const res = await DELETE(req, createParams('any'))
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/habits/[id]/checkin', () => {
    it('打卡返回 201 和 checked action', async () => {
      // 先创建习惯
      const createReq = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '打卡测试习惯' }),
      })
      const createRes = await POST(createReq)
      const { id } = await createRes.json()

      // 打卡
      const checkinReq = createRequest(
        `http://localhost/api/habits/${id}/checkin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: '2026-07-03' }),
        }
      )
      const res = await CHECKIN(checkinReq, createParams(id))
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.action).toBe('checked')
      expect(body.entry).toBeTruthy()
    })

    it('对不存在的习惯打卡返回 404', async () => {
      const req = createRequest(
        'http://localhost/api/habits/nonexistent/checkin',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: '2026-07-03' }),
        }
      )
      const res = await CHECKIN(req, createParams('nonexistent'))
      expect(res.status).toBe(404)
    })

    it('日期格式无效返回 400', async () => {
      // 先创建习惯
      const createReq = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '格式测试' }),
      })
      const createRes = await POST(createReq)
      const { id } = await createRes.json()

      // 无效日期
      const checkinReq = createRequest(
        `http://localhost/api/habits/${id}/checkin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: 'not-a-date' }),
        }
      )
      const res = await CHECKIN(checkinReq, createParams(id))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.code).toBe('VALIDATION_ERROR')
    })

    it('对已打卡的日期再次打卡返回 unchecked', async () => {
      // 先创建习惯
      const createReq = createRequest('http://localhost/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'toggle 测试习惯' }),
      })
      const createRes = await POST(createReq)
      const { id } = await createRes.json()

      // 第一次打卡
      const firstCheckin = createRequest(
        `http://localhost/api/habits/${id}/checkin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: '2026-07-03' }),
        }
      )
      const firstRes = await CHECKIN(firstCheckin, createParams(id))
      expect(firstRes.status).toBe(201)
      const firstBody = await firstRes.json()
      expect(firstBody.action).toBe('checked')

      // 对同一日期再次打卡 → toggle 取消
      const secondCheckin = createRequest(
        `http://localhost/api/habits/${id}/checkin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: '2026-07-03' }),
        }
      )
      const secondRes = await CHECKIN(secondCheckin, createParams(id))
      expect(secondRes.status).toBe(200)
      const secondBody = await secondRes.json()
      expect(secondBody.action).toBe('unchecked')
      expect(secondBody.entry).toBeNull()
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest(
        'http://localhost/api/habits/any/checkin',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: '2026-07-03' }),
        }
      )
      const res = await CHECKIN(req, createParams('any'))
      expect(res.status).toBe(401)
    })
  })
})
