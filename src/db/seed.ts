import { db } from './index'
import { goals, habits, habitEntries } from './schema'
import { count } from 'drizzle-orm'

const seedGoals = [
  { title: '储蓄目标', targetValue: 10000, unit: '元', currentValue: 3500 },
  { title: '健康目标', targetValue: 30, unit: 'kg', currentValue: 5 },
  { title: '学习目标', targetValue: 12, unit: '本', currentValue: 3 },
]

const seedHabits = [
  { title: '运动', frequency: 'daily' },
  { title: '阅读', frequency: 'daily' },
  { title: '冥想', frequency: 'daily' },
]

/**
 * 种子数据函数
 * 检查数据库是否为空，为空则插入示例数据
 * 幂等设计，可安全重复调用
 */
export async function seed() {
  const result = db.select({ value: count() }).from(goals).get()
  if (result && result.value > 0) {
    return
  }

  console.log('[seed] 数据库为空，写入种子数据...')

  const insertedGoals = db.insert(goals).values(seedGoals).returning({ id: goals.id }).all()
  console.log(`[seed] 已创建 ${insertedGoals.length} 个示例目标`)

  const insertedHabits = db.insert(habits).values(seedHabits).returning({ id: habits.id }).all()
  console.log(`[seed] 已创建 ${insertedHabits.length} 个示例习惯`)

  // 为每个习惯创建过去 7 天的打卡记录，约 70% 完成率
  const today = new Date()
  const entries: Array<{ habitId: string; date: string; completed: number }> = []

  for (let habitIdx = 0; habitIdx < insertedHabits.length; habitIdx++) {
    const habitId = insertedHabits[habitIdx].id
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset)
      const date = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-')

      // 使用种子值确定性地决定完成状态，约 70% 完成率
      const seedVal = (habitIdx * 7 + dayOffset) % 10
      const completed = seedVal < 7 ? 1 : 0

      entries.push({ habitId, date, completed })
    }
  }

  db.insert(habitEntries).values(entries).run()
  console.log(`[seed] 已创建 ${entries.length} 条打卡记录`)

  console.log('[seed] 种子数据写入完成')
}
