import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { evaluateRules } from '@/engine/rules'
import { performFullSync, centsToAmount } from '@/lib/actual'
import { db } from '@/db'
import { accounts, transactions } from '@/db/schema'
import { nanoid } from 'nanoid'


/** POST /api/sync - 触发 Actual Budget 数据同步（长耗时操作） */
export async function POST() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // 从 Actual Budget 拉取最近 30 天数据
    const result = await performFullSync(30)

    // 将同步数据写入本地 SQLite 数据库
    // upsert accounts
    for (const acc of result.accounts) {
      // Actual API 不返回 type 字段，根据账户名称推断类型
      const nameLower = acc.name.toLowerCase()
      const accountType = nameLower.includes('savings') ? 'savings'
        : nameLower.includes('credit') ? 'credit'
        : 'checking'

      await db.insert(accounts).values({
        id: acc.id,
        name: acc.name,
        type: accountType,
        balance: centsToAmount(acc.balance_current ?? 0),
        syncId: acc.id,
      }).onConflictDoUpdate({
        target: accounts.syncId,
        set: {
          name: acc.name,
          balance: centsToAmount(acc.balance_current ?? 0),
          updatedAt: new Date()
        }
      })
    }

    // upsert transactions
    for (const [accountId, txns] of Object.entries(result.transactions)) {
      for (const txn of txns) {
        await db.insert(transactions).values({
          id: nanoid(),
          accountId,
          amount: centsToAmount(txn.amount),
          date: txn.date,
          payee: txn.payee ?? undefined,
          category: txn.category ?? undefined,
          syncId: txn.id,
        }).onConflictDoUpdate({
          target: transactions.syncId,
          set: {
            amount: centsToAmount(txn.amount),
            payee: txn.payee ?? undefined
          }
        })
      }
    }

    // 异步触发财务规则评估，不阻塞响应
    evaluateRules('finance').catch((err) =>
      console.error('规则评估失败:', err)
    )

    return NextResponse.json({
      status: 'completed',
      syncedAt: result.syncedAt,
      accountCount: result.accounts.length,
      transactionCounts: Object.fromEntries(
        Object.entries(result.transactions).map(([id, txns]) => [id, txns.length])
      ),
      accounts: result.accounts.map((acc) => ({
        id: acc.id,
        name: acc.name,
        offbudget: acc.offbudget,
        closed: acc.closed,
        balance: acc.balance_current,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    // 区分连接错误和内部错误
    if (
      message.includes('ACTUAL_SERVER_URL') ||
      message.includes('ACTUAL_BUDGET_ID') ||
      message.includes('connect') ||
      message.includes('timeout')
    ) {
      return NextResponse.json(
        { error: `Actual Budget 连接失败: ${message}`, code: 'SYNC_CONNECTION_ERROR' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: '同步过程中发生内部错误', code: 'SYNC_INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
