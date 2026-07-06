/**
 * 环境感知的数据库模块
 *
 * - 服务端（Node.js）：使用 better-sqlite3 + drizzle-orm
 * - 客户端（浏览器/Capacitor）：导出 proxy 对象，实际数据通过 fetch 拦截器从 wa-sqlite 读取
 *
 * 客户端 bundle 不会执行 better-sqlite3 代码，但需要此文件能被安全 import。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null

if (typeof window === 'undefined') {
  // 服务端：使用 better-sqlite3 + drizzle
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3')
    const { drizzle } = require('drizzle-orm/better-sqlite3')
    const { mkdirSync } = require('fs')
    const { dirname } = require('path')
    const schema = require('./schema')

    const dbPath = process.env.DATABASE_PATH || './data/app.db'
    mkdirSync(dirname(dbPath), { recursive: true })

    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('busy_timeout = 5000')

    db = drizzle(sqlite, { schema })
  } catch {
    // better-sqlite3 不可用（不应该在服务端发生）
    console.warn('[db] better-sqlite3 加载失败，数据库不可用')
  }
} else {
  // 客户端：创建 proxy，防止 import 崩溃
  // 实际数据操作由 fetch 拦截器处理，此 proxy 仅作为安全占位
  const noop = () => proxy
  const proxy = new Proxy({}, {
    get: (_target, prop) => {
      if (prop === 'then') return undefined // 防止被当作 Promise
      return noop
    },
  })
  db = proxy
}

export { db }
