import { describe, it, expect, vi, beforeEach } from 'vitest'

// ====== Mock 模块 ======

// mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => ({ name: 'erp-session', value: 'mock-token' })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

// mock auth - 默认已认证
vi.mock('@/lib/auth', () => ({
  isAuthenticated: vi.fn(async () => true),
}))

// mock goals query
const mockGoals: Record<string, unknown>[] = []
let goalIdCounter = 0

vi.mock('@/db/queries/goals', () => ({
  getAllGoals: vi.fn(() => mockGoals),
  getGoalById: vi.fn((id: string) => mockGoals.find((g) => g.id === id)),
  createGoal: vi.fn((data: Record<string, unknown>) => {
    const goal = {
      id: `goal-${++goalIdCounter}`,
      ...data,
      currentValue: data.currentValue ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockGoals.push(goal)
    return goal
  }),
  updateGoal: vi.fn((id: string, data: Record<string, unknown>) => {
    const goal = mockGoals.find((g) => g.id === id)
    if (!goal) return undefined
    Object.assign(goal, data, { updatedAt: new Date() })
    return goal
  }),
  deleteGoal: vi.fn((id: string) => {
    const idx = mockGoals.findIndex((g) => g.id === id)
    if (idx === -1) return false
    mockGoals.splice(idx, 1)
    return true
  }),
}))

// mock engine/rules
vi.mock('@/engine/rules', () => ({
  evaluateRules: vi.fn(async () => []),
}))

// ====== 导入被测模块（在 mock 之后） ======
import { GET, POST } from '@/app/api/goals/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/goals/[id]/route'
import { isAuthenticated } from '@/lib/auth'

function createRequest(url: string, init?: RequestInit): Request {
  return new Request(url, init)
}

function createParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('Goals API', () => {
  beforeEach(() => {
    // 清空 mock 数据
    mockGoals.length = 0
    goalIdCounter = 0
    vi.mocked(isAuthenticated).mockResolvedValue(true)
  })

  describe('GET /api/goals', () => {
    it('返回 200 和目标列表', async () => {
      const res = await GET()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('goals')
      expect(Array.isArray(body.goals)).toBe(true)
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const res = await GET()
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.code).toBe('UNAUTHORIZED')
    })
  })

  describe('POST /api/goals', () => {
    it('创建目标返回 201', async () => {
      const req = createRequest('http://localhost/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '健身目标',
          targetValue: 100,
          unit: '次',
        }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body).toHaveProperty('id')
      expect(body.id).toBeTruthy()
    })

    it('缺少必填字段返回 400', async () => {
      const req = createRequest('http://localhost/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.code).toBe('VALIDATION_ERROR')
    })

    it('targetValue 为负数返回 400', async () => {
      const req = createRequest('http://localhost/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '测试', targetValue: -1 }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest('http://localhost/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '测试', targetValue: 10 }),
      })
      const res = await POST(req)
      expect(res.status).toBe(401)
    })
  })

  describe('PUT /api/goals/[id]', () => {
    it('更新目标返回 200', async () => {
      // 先创建一个目标
      const createReq = createRequest('http://localhost/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '原始目标', targetValue: 50 }),
      })
      const createRes = await POST(createReq)
      const { id } = await createRes.json()

      // 更新
      const updateReq = createRequest(`http://localhost/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '更新后的目标', currentValue: 25 }),
      })
      const res = await PUT(updateReq, createParams(id))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.goal).toBeTruthy()
    })

    it('更新不存在的目标返回 404', async () => {
      const req = createRequest('http://localhost/api/goals/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '不存在' }),
      })
      const res = await PUT(req, createParams('nonexistent'))
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.code).toBe('NOT_FOUND')
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest('http://localhost/api/goals/any', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'test' }),
      })
      const res = await PUT(req, createParams('any'))
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/goals/[id]', () => {
    it('删除目标返回 200', async () => {
      // 先创建
      const createReq = createRequest('http://localhost/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '待删除目标', targetValue: 10 }),
      })
      const createRes = await POST(createReq)
      const { id } = await createRes.json()

      // 删除
      const deleteReq = createRequest(`http://localhost/api/goals/${id}`, {
        method: 'DELETE',
      })
      const res = await DELETE(deleteReq, createParams(id))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    it('删除不存在的目标返回 404', async () => {
      const req = createRequest('http://localhost/api/goals/nonexistent', {
        method: 'DELETE',
      })
      const res = await DELETE(req, createParams('nonexistent'))
      expect(res.status).toBe(404)
    })

    it('未认证返回 401', async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false)
      const req = createRequest('http://localhost/api/goals/any', {
        method: 'DELETE',
      })
      const res = await DELETE(req, createParams('any'))
      expect(res.status).toBe(401)
    })
  })
})
