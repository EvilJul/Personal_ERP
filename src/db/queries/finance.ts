import { db } from '@/db'
import { accounts, transactions } from '@/db/schema'
import { eq, and, gte, lte, isNotNull, desc } from 'drizzle-orm'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Account = InferSelectModel<typeof accounts>
export type NewAccount = InferInsertModel<typeof accounts>
export type Transaction = InferSelectModel<typeof transactions>
export type NewTransaction = InferInsertModel<typeof transactions>

/** 获取所有账户 */
export function getAllAccounts(): Account[] {
  return db.select().from(accounts).all()
}

/** 按 ID 获取单个账户 */
export function getAccountById(id: string): Account | undefined {
  return db.select().from(accounts).where(eq(accounts.id, id)).get()
}

/** 按同步 ID 获取账户（用于 Actual Budget 同步） */
export function getAccountBySyncId(syncId: string): Account | undefined {
  return db.select().from(accounts).where(eq(accounts.syncId, syncId)).get()
}

/** 按类型获取账户列表 */
export function getAccountsByType(type: string): Account[] {
  return db.select().from(accounts).where(eq(accounts.type, type)).all()
}

/** 创建账户 */
export function createAccount(data: Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>): Account {
  return db.insert(accounts).values(data).returning().get()
}

/** 更新账户 */
export function updateAccount(id: string, data: Partial<Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>>): Account | undefined {
  return db.update(accounts).set(data).where(eq(accounts.id, id)).returning().get()
}

/** 删除账户 */
export function deleteAccount(id: string): boolean {
  const result = db.delete(accounts).where(eq(accounts.id, id)).run()
  return result.changes > 0
}

/** 获取所有交易，按日期倒序 */
export function getAllTransactions(): Transaction[] {
  return db.select().from(transactions).orderBy(desc(transactions.date)).all()
}

/** 按 ID 获取单个交易 */
export function getTransactionById(id: string): Transaction | undefined {
  return db.select().from(transactions).where(eq(transactions.id, id)).get()
}

/** 按同步 ID 获取交易（用于 Actual Budget 同步） */
export function getTransactionBySyncId(syncId: string): Transaction | undefined {
  return db.select().from(transactions).where(eq(transactions.syncId, syncId)).get()
}

/** 按日期范围获取交易 */
export function getTransactionsByDateRange(startDate: string, endDate: string): Transaction[] {
  return db.select().from(transactions)
    .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
    .orderBy(desc(transactions.date))
    .all()
}

/** 按分类获取交易 */
export function getTransactionsByCategory(category: string): Transaction[] {
  return db.select().from(transactions)
    .where(eq(transactions.category, category))
    .orderBy(desc(transactions.date))
    .all()
}

/** 按账户 ID 获取交易 */
export function getTransactionsByAccountId(accountId: string): Transaction[] {
  return db.select().from(transactions)
    .where(eq(transactions.accountId, accountId))
    .orderBy(desc(transactions.date))
    .all()
}

/** 获取所有交易分类（去重） */
export function getTransactionCategories(): string[] {
  const results = db.select({ category: transactions.category })
    .from(transactions)
    .where(isNotNull(transactions.category))
    .groupBy(transactions.category)
    .all()
  return results.map((r: { category: string | null }) => r.category!)
}

/** 创建交易 */
export function createTransaction(data: Omit<NewTransaction, 'id' | 'createdAt'>): Transaction {
  return db.insert(transactions).values(data).returning().get()
}

/** 更新交易 */
export function updateTransaction(id: string, data: Partial<Omit<NewTransaction, 'id' | 'createdAt'>>): Transaction | undefined {
  return db.update(transactions).set(data).where(eq(transactions.id, id)).returning().get()
}

/** 删除交易 */
export function deleteTransaction(id: string): boolean {
  const result = db.delete(transactions).where(eq(transactions.id, id)).run()
  return result.changes > 0
}

/** 获取交易汇总（按日期范围） */
export function getTransactionSummary(startDate: string, endDate: string): {
  totalAmount: number
  transactionCount: number
  categories: { category: string; count: number; total: number }[]
} {
  const transactions = getTransactionsByDateRange(startDate, endDate)
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  // 按分类分组统计
  const categoryMap = new Map<string, { count: number; total: number }>()
  transactions.forEach(t => {
    const category = t.category || '未分类'
    const existing = categoryMap.get(category) || { count: 0, total: 0 }
    existing.count += 1
    existing.total += t.amount
    categoryMap.set(category, existing)
  })
  
  return {
    totalAmount,
    transactionCount: transactions.length,
    categories: Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    })),
  }
}