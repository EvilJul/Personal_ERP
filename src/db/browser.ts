import { nanoid } from 'nanoid'

// ====== wa-sqlite 浏览器数据库单例 ======

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlite3: any = null
let db: number | null = null
let initPromise: Promise<void> | null = null

/** 确保数据库已初始化 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ensureBrowserDb(): Promise<{ sqlite3: any; db: number }> {
  if (sqlite3 && db !== null) {
    return { sqlite3, db }
  }

  if (!initPromise) {
    initPromise = initWaSqlite()
  }

  await initPromise

  if (!sqlite3 || db === null) {
    throw new Error('wa-sqlite 初始化失败')
  }

  return { sqlite3, db }
}

async function initWaSqlite() {
  // 动态导入 wa-sqlite（避免 SSR 问题）
  const SQLiteESMFactory = (await import('wa-sqlite/dist/wa-sqlite-async.mjs')).default
  const SQLiteModule = await import('wa-sqlite')

  const module = await SQLiteESMFactory()
  sqlite3 = SQLiteModule.Factory(module)
  db = await sqlite3.open_v2('personal-erp')

  // 设置基本 pragma
  await sqlite3.exec(db, 'PRAGMA busy_timeout = 5000')

  // 创建表
  await createTables()

  // 写入种子数据（幂等）
  await seedData()
}

async function createTables() {
  if (!sqlite3 || db === null) return

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      actual_server_url TEXT,
      actual_password TEXT,
      actual_budget_id TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      current_value REAL DEFAULT 0,
      target_value REAL NOT NULL,
      unit TEXT,
      deadline TEXT,
      linked_modules TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      frequency TEXT DEFAULT 'daily',
      linked_goal_id TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS habit_entries (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      UNIQUE(habit_id, date)
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS connection_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      enabled INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS rule_conditions (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      module TEXT NOT NULL,
      field TEXT NOT NULL,
      operator TEXT NOT NULL,
      value TEXT NOT NULL
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS rule_actions (
      id TEXT PRIMARY KEY,
      rule_id TEXT NOT NULL,
      type TEXT NOT NULL,
      target_module TEXT,
      parameters TEXT
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS insights (
      id TEXT PRIMARY KEY,
      rule_id TEXT,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'info',
      data TEXT,
      read INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL DEFAULT 0,
      sync_id TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      condition TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      rarity TEXT DEFAULT 'common',
      tier INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      user_id TEXT DEFAULT 'default',
      badge_id TEXT NOT NULL,
      tier INTEGER DEFAULT 1,
      unlocked_at INTEGER DEFAULT (unixepoch()),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)

  await sqlite3.exec(db, `
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      payee TEXT,
      category TEXT,
      sync_id TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `)
}

/** 种子数据（与 src/db/seed.ts 逻辑一致，幂等设计） */
async function seedData() {
  if (!sqlite3 || db === null) return

  // 检查目标表是否为空
  const goalCountRows = await dbAll<{ cnt: number }>('SELECT COUNT(*) as cnt FROM goals')
  if (goalCountRows.length > 0 && Number(goalCountRows[0].cnt) === 0) {
    const now = Math.floor(Date.now() / 1000)
    const seedGoals = [
      { id: nanoid(), title: '储蓄目标', targetValue: 10000, unit: '元', currentValue: 3500 },
      { id: nanoid(), title: '健康目标', targetValue: 30, unit: 'kg', currentValue: 5 },
      { id: nanoid(), title: '学习目标', targetValue: 12, unit: '本', currentValue: 3 },
    ]

    for (const g of seedGoals) {
      await dbRun(
        'INSERT INTO goals (id, title, target_value, unit, current_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [g.id, g.title, g.targetValue, g.unit, g.currentValue, now, now]
      )
    }

    const seedHabits = [
      { id: nanoid(), title: '运动', frequency: 'daily' },
      { id: nanoid(), title: '阅读', frequency: 'daily' },
      { id: nanoid(), title: '冥想', frequency: 'daily' },
    ]

    for (const h of seedHabits) {
      await dbRun(
        'INSERT INTO habits (id, title, frequency, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [h.id, h.title, h.frequency, now, now]
      )
    }

    // 为每个习惯创建过去 7 天的打卡记录
    const entries: Array<{ habitId: string; date: string; completed: number }> = []
    for (let habitIdx = 0; habitIdx < seedHabits.length; habitIdx++) {
      const habitId = seedHabits[habitIdx].id
      for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
        const d = new Date()
        d.setDate(d.getDate() - dayOffset)
        const date = [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, '0'),
          String(d.getDate()).padStart(2, '0'),
        ].join('-')
        const seedVal = (habitIdx * 7 + dayOffset) % 10
        const completed = seedVal < 7 ? 1 : 0
        entries.push({ habitId, date, completed })
      }
    }

    for (const e of entries) {
      await dbRun(
        'INSERT OR IGNORE INTO habit_entries (id, habit_id, date, completed) VALUES (?, ?, ?, ?)',
        [nanoid(), e.habitId, e.date, e.completed]
      )
    }
  }

  // 徽章种子数据
  const badgeCountRows = await dbAll<{ cnt: number }>('SELECT COUNT(*) as cnt FROM badges')
  if (badgeCountRows.length > 0 && Number(badgeCountRows[0].cnt) === 0) {
    const now = Math.floor(Date.now() / 1000)
    const badgeDefinitions = [
      { name: '萌芽', category: 'goal', condition: '{"type":"goal_created","thresholds":[1,3,5,10]}', icon: '🌱', description: '创建第一个目标', rarity: 'common' },
      { name: '目标达成者', category: 'goal', condition: '{"type":"goal_progress","thresholds":[25,50,75,100]}', icon: '🎯', description: '目标进度里程碑', rarity: 'rare' },
      { name: '超额完成', category: 'goal', condition: '{"type":"goal_exceed","thresholds":[110,125,150,200]}', icon: '🚀', description: '目标超过 100%', rarity: 'epic' },
      { name: '连续打卡', category: 'habit', condition: '{"type":"habit_streak","thresholds":[3,7,14,30]}', icon: '🔥', description: '连续打卡天数', rarity: 'rare' },
      { name: '早起鸟', category: 'habit', condition: '{"type":"habit_early","thresholds":[1,7,14,30]}', icon: '🐦', description: '早上 6 点前打卡', rarity: 'epic' },
      { name: '全能选手', category: 'habit', condition: '{"type":"habit_all_daily","thresholds":[1,7,14,30]}', icon: '⭐', description: '所有习惯都打卡', rarity: 'legendary' },
      { name: '储蓄达人', category: 'finance', condition: '{"type":"savings_milestone","thresholds":[1000,5000,10000,50000]}', icon: '💰', description: '储蓄里程碑', rarity: 'rare' },
      { name: '预算大师', category: 'finance', condition: '{"type":"budget_streak","thresholds":[1,3,6,12]}', icon: '📊', description: '连续控制预算', rarity: 'epic' },
      { name: '完美一天', category: 'special', condition: '{"type":"perfect_day","thresholds":[1,3,7,30]}', icon: '🌟', description: '所有模块都有进展', rarity: 'legendary' },
      { name: '洞察收集者', category: 'special', condition: '{"type":"insight_count","thresholds":[5,20,50,100]}', icon: '💡', description: '累计洞察数量', rarity: 'epic' },
    ]

    for (const b of badgeDefinitions) {
      await dbRun(
        'INSERT INTO badges (id, name, category, condition, icon, description, rarity, tier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)',
        [nanoid(), b.name, b.category, b.condition, b.icon, b.description, b.rarity, now, now]
      )
    }
  }
}

// ====== 查询辅助函数 ======

/** 执行查询并返回对象数组 */
async function dbAll<T extends Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
  const { sqlite3: s, db: d } = await ensureBrowserDb()

  if (params && params.length > 0) {
    const result = await s.execWithParams(d, sql, params as (string | number | null)[])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.rows.map((row: any[]) => {
      const obj: Record<string, unknown> = {}
      result.columns.forEach((col: string, i: number) => {
        obj[col] = row[i]
      })
      return obj as T
    })
  }

  const results: T[] = []
  await s.exec(d, sql, (row: (string | number | null)[], columns: string[]) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    results.push(obj as T)
  })
  return results
}

/** 执行 INSERT/UPDATE/DELETE */
async function dbRun(sql: string, params?: unknown[]): Promise<number> {
  const { sqlite3: s, db: d } = await ensureBrowserDb()
  if (params && params.length > 0) {
    return await s.run(d, sql, params as (string | number | null)[])
  }
  return await s.run(d, sql)
}
