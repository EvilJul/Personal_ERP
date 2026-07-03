import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16
const SALT = 'personal-erp-salt'

/**
 * 从 SESSION_SECRET 派生 AES-256 密钥
 * 使用 scrypt 进行密钥派生，提供抗暴力破解能力
 */
function deriveKey(): Buffer {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET 环境变量未设置')
  }
  return scryptSync(secret, SALT, 32)
}

/**
 * 加密明文字符串
 * @returns 格式为 "iv:tag:encrypted" 的 hex 编码字符串
 */
export function encrypt(plaintext: string): string {
  const key = deriveKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const tag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

/**
 * 解密加密字符串
 * @param ciphertext - 格式为 "iv:tag:encrypted" 的 hex 编码字符串
 * @returns 解密后的明文
 */
export function decrypt(ciphertext: string): string {
  const key = deriveKey()
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':')

  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('无效的加密格式')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * 判断值是否为加密格式（iv:tag:encrypted）
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':')
  return (
    parts.length === 3 &&
    parts[0].length === 24 && // IV hex = 12 bytes * 2
    parts[1].length === 32 // Tag hex = 16 bytes * 2
  )
}
