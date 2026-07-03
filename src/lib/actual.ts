import * as api from '@actual-app/api'
import path from 'path'

// Actual Budget 同步缓存目录
// Docker 环境通过 ACTUAL_CACHE_PATH 环境变量指向 /app/actual-cache/
const CACHE_DIR = process.env.ACTUAL_CACHE_PATH || path.join(process.cwd(), 'data', 'actual-cache')

// 从 API 返回类型推断实体类型
type Account = Awaited<ReturnType<typeof api.getAccounts>>[number]
type Transaction = Awaited<ReturnType<typeof api.getTransactions>>[number]

type SyncResult = {
  accounts: Account[]
  transactions: Record<string, Transaction[]>
  syncedAt: string
}

// 超时时间：30 秒
const TIMEOUT_MS = 30000

/**
 * 为 Promise 添加超时控制
 */
async function withTimeout<T>(promise: Promise<T>, ms: number = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`操作超时 (${ms}ms)`)), ms)
    )
  ])
}

/**
 * 连接 Actual Budget 服务器并下载预算数据
 * 必须在操作完成后调用 disconnectActual() 释放连接
 */
export async function connectToActual() {
  const serverURL = process.env.ACTUAL_SERVER_URL
  const password = process.env.ACTUAL_PASSWORD
  const budgetId = process.env.ACTUAL_BUDGET_ID

  if (!serverURL) {
    throw new Error('ACTUAL_SERVER_URL 环境变量未配置')
  }
  if (!budgetId) {
    throw new Error('ACTUAL_BUDGET_ID 环境变量未配置')
  }

  // InitConfig 要求 password 为 string（PasswordAuthConfig）或不含 password（NoServerConfig）
  // 有 serverURL 时必须提供 password
  if (!password) {
    throw new Error('ACTUAL_PASSWORD 环境变量未配置')
  }

  await withTimeout(api.init({
    dataDir: CACHE_DIR,
    serverURL,
    password,
  }))

  await withTimeout(api.downloadBudget(budgetId, { password }))
}

/**
 * 断开 Actual Budget 连接，同步并释放资源
 */
export async function disconnectActual() {
  await api.shutdown()
}

/**
 * 获取所有 Actual Budget 账户
 */
export async function syncAccounts(): Promise<Account[]> {
  return await api.getAccounts()
}

/**
 * 获取指定账户最近 N 天的交易记录
 * @param accountId - Actual Budget 中的账户 ID
 * @param days - 回溯天数，默认 30
 */
export async function syncTransactions(
  accountId: string,
  days: number = 30
): Promise<Transaction[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Actual API 日期格式：YYYY-MM-DD
  const start = startDate.toISOString().slice(0, 10)
  const end = endDate.toISOString().slice(0, 10)

  return await api.getTransactions(accountId, start, end)
}

/**
 * 执行完整的同步流程：连接 → 拉取账户 → 拉取交易 → 断开
 * 返回同步结果
 */
export async function performFullSync(days: number = 30): Promise<SyncResult> {
  try {
    await connectToActual()

    const accounts = await syncAccounts()

    const transactions: Record<string, Transaction[]> = {}
    for (const account of accounts) {
      if (!account.closed) {
        transactions[account.id] = await syncTransactions(account.id, days)
      }
    }

    return {
      accounts,
      transactions,
      syncedAt: new Date().toISOString(),
    }
  } finally {
    // 确保连接被释放，即使发生异常
    await disconnectActual()
  }
}

/**
 * 将 Actual Budget 的分（整数）金额转换为元（浮点数）
 * Actual Budget 内部以分为单位存储：-5000 = -$50.00
 */
export function centsToAmount(cents: number): number {
  return api.utils.integerToAmount(cents)
}
