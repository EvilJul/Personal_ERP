import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock next/headers 必须在模块 import 之前
vi.mock('next/headers', () => {
  const store = new Map<string, string>()
  return {
    cookies: vi.fn(async () => ({
      get: (name: string) => {
        const value = store.get(name)
        return value ? { name, value } : undefined
      },
      set: (name: string, value: string) => {
        store.set(name, value)
      },
      delete: (name: string) => {
        store.delete(name)
      },
    })),
    __store: store,
  }
})

import { validatePassword, createSession, destroySession, isAuthenticated } from '@/lib/auth'

describe('auth 模块', () => {
  describe('validatePassword', () => {
    it('正确密码返回 true', () => {
      // APP_PASSWORD 在 setup.ts 中设置为 'test-password-123'
      expect(validatePassword('test-password-123')).toBe(true)
    })

    it('错误密码返回 false', () => {
      expect(validatePassword('wrong-password')).toBe(false)
    })

    it('空密码返回 false', () => {
      expect(validatePassword('')).toBe(false)
    })

    it('大小写敏感', () => {
      expect(validatePassword('Test-Password-123')).toBe(false)
    })

    it('缺少 APP_PASSWORD 环境变量时返回 false', () => {
      const original = process.env.APP_PASSWORD
      delete process.env.APP_PASSWORD
      expect(validatePassword('test-password-123')).toBe(false)
      process.env.APP_PASSWORD = original
    })
  })

  describe('createSession / isAuthenticated', () => {
    it('创建 session 后 isAuthenticated 返回 true', async () => {
      await createSession()
      const result = await isAuthenticated()
      expect(result).toBe(true)
    })

    it('未创建 session 时 isAuthenticated 返回 false', async () => {
      // 先销毁可能存在的 session
      await destroySession()
      const result = await isAuthenticated()
      expect(result).toBe(false)
    })

    it('destroySession 后 isAuthenticated 返回 false', async () => {
      await createSession()
      expect(await isAuthenticated()).toBe(true)

      await destroySession()
      expect(await isAuthenticated()).toBe(false)
    })

    it('createSession 创建的 token 包含正确的 cookie 名称', async () => {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()

      await createSession()

      // 验证 cookie 已设置（通过检查 isAuthenticated 能通过）
      expect(await isAuthenticated()).toBe(true)

      // 通过 store 检查 cookie 名称为 erp-session
      const store = (await import('next/headers')).__store as Map<string, string>
      expect(store.has('erp-session')).toBe(true)
    })
  })
})
