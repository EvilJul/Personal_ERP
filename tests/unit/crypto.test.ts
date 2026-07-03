import { describe, it, expect, beforeAll } from 'vitest'
import { encrypt, decrypt, isEncrypted } from '@/lib/crypto'

describe('crypto 模块', () => {
  describe('encrypt', () => {
    it('返回非空字符串', () => {
      const result = encrypt('hello world')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('每次加密结果不同（随机 IV）', () => {
      const a = encrypt('same text')
      const b = encrypt('same text')
      // 相同明文加密两次，由于 IV 不同，密文应不同
      expect(a).not.toBe(b)
    })

    it('加密结果符合 iv:tag:encrypted 格式', () => {
      const result = encrypt('test data')
      const parts = result.split(':')
      expect(parts.length).toBe(3)
      // IV: 12 bytes = 24 hex chars
      expect(parts[0].length).toBe(24)
      // Tag: 16 bytes = 32 hex chars
      expect(parts[1].length).toBe(32)
      // Encrypted: 非空
      expect(parts[2].length).toBeGreaterThan(0)
    })
  })

  describe('decrypt', () => {
    it('decrypt(encrypt(text)) === text', () => {
      const plaintext = '这是一个测试字符串 Hello 123 !@#'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(plaintext)
    })

    it('空字符串加密后解密抛出异常（encryptedHex 为空串不满足格式校验）', () => {
      const encrypted = encrypt('')
      // encrypted 部分为空字符串，split 后 encryptedHex 为 ''，falsy，触发校验
      expect(() => decrypt(encrypted)).toThrow('无效的加密格式')
    })

    it('能正确解密长文本', () => {
      const plaintext = 'A'.repeat(10000)
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(plaintext)
    })

    it('能正确解密包含特殊字符的文本', () => {
      const plaintext = '中文\n换行\t制表符\0null emoji:🎉'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(plaintext)
    })

    it('无效密文格式抛出异常', () => {
      expect(() => decrypt('invalid-format')).toThrow('无效的加密格式')
    })

    it('空字符串密文抛出异常', () => {
      expect(() => decrypt('')).toThrow('无效的加密格式')
    })

    it('篡改 IV 导致解密失败', () => {
      const encrypted = encrypt('secret')
      const parts = encrypted.split(':')
      // 篡改 IV 的第一个字符
      parts[0] = 'f' + parts[0].slice(1)
      const tampered = parts.join(':')
      expect(() => decrypt(tampered)).toThrow()
    })

    it('篡改 tag 导致解密失败', () => {
      const encrypted = encrypt('secret')
      const parts = encrypted.split(':')
      // 篡改 tag 的第一个字符
      parts[1] = 'f' + parts[1].slice(1)
      const tampered = parts.join(':')
      expect(() => decrypt(tampered)).toThrow()
    })

    it('篡改密文内容导致解密失败', () => {
      const encrypted = encrypt('secret')
      const parts = encrypted.split(':')
      // 篡改加密内容的最后一个字符
      const last = parts[2].slice(-1)
      parts[2] = parts[2].slice(0, -1) + (last === 'a' ? 'b' : 'a')
      const tampered = parts.join(':')
      expect(() => decrypt(tampered)).toThrow()
    })
  })

  describe('isEncrypted', () => {
    it('正确识别加密格式', () => {
      const encrypted = encrypt('test')
      expect(isEncrypted(encrypted)).toBe(true)
    })

    it('拒绝非加密格式的普通字符串', () => {
      expect(isEncrypted('hello world')).toBe(false)
    })

    it('拒绝空字符串', () => {
      expect(isEncrypted('')).toBe(false)
    })

    it('拒绝只有两段的字符串', () => {
      expect(isEncrypted('abc:def')).toBe(false)
    })

    it('拒绝四段格式的字符串', () => {
      expect(isEncrypted('abc:def:ghi:jkl')).toBe(false)
    })

    it('拒绝 IV 长度不正确的字符串', () => {
      // IV 应为 24 hex chars，这里给 10
      expect(isEncrypted('abcdef1234:0123456789abcdef0123456789ab:data')).toBe(false)
    })

    it('拒绝 tag 长度不正确的字符串', () => {
      // Tag 应为 32 hex chars，这里给 10
      expect(isEncrypted('abcdef1234567890abcdef12:0123456789:data')).toBe(false)
    })
  })
})
