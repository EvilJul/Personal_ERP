import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import * as schema from './schema'

// Docker 环境通过 DATABASE_PATH 环境变量指向 /app/data/app.db
// 本地开发默认使用 ./data/app.db
const dbPath = process.env.DATABASE_PATH || './data/app.db'

// 确保数据库目录存在
mkdirSync(dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('busy_timeout = 5000')

export const db = drizzle(sqlite, { schema })
