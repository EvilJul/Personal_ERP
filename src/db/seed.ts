import { db } from './index'
import { goals, habits, habitEntries, badges } from './schema'
import { count } from 'drizzle-orm'

// ====== 徽章种子定义 ======
const badgeDefinitions = [
  // 目标类
  {
    name: '萌芽',
    category: 'goal',
    condition: JSON.stringify({ type: 'goal_created', thresholds: [1, 3, 5, 10] }),
    icon: '🌱',
    description: '创建第一个目标',
    rarity: 'common',
  },
  {
    name: '目标达成者',
    category: 'goal',
    condition: JSON.stringify({ type: 'goal_progress', thresholds: [25, 50, 75, 100] }),
    icon: '🎯',
    description: '目标进度里程碑',
    rarity: 'rare',
  },
  {
    name: '超额完成',
    category: 'goal',
    condition: JSON.stringify({ type: 'goal_exceed', thresholds: [110, 125, 150, 200] }),
    icon: '🚀',
    description: '目标超过 100%',
    rarity: 'epic',
  },

  // 习惯类
  {
    name: '连续打卡',
    category: 'habit',
    condition: JSON.stringify({ type: 'habit_streak', thresholds: [3, 7, 14, 30] }),
    icon: '🔥',
    description: '连续打卡天数',
    rarity: 'rare',
  },
  {
    name: '早起鸟',
    category: 'habit',
    condition: JSON.stringify({ type: 'habit_early', thresholds: [1, 7, 14, 30] }),
    icon: '🐦',
    description: '早上 6 点前打卡',
    rarity: 'epic',
  },
  {
    name: '全能选手',
    category: 'habit',
    condition: JSON.stringify({ type: 'habit_all_daily', thresholds: [1, 7, 14, 30] }),
    icon: '⭐',
    description: '所有习惯都打卡',
    rarity: 'legendary',
  },

  // 财务类
  {
    name: '储蓄达人',
    category: 'finance',
    condition: JSON.stringify({ type: 'savings_milestone', thresholds: [1000, 5000, 10000, 50000] }),
    icon: '💰',
    description: '储蓄里程碑',
    rarity: 'rare',
  },
  {
    name: '预算大师',
    category: 'finance',
    condition: JSON.stringify({ type: 'budget_streak', thresholds: [1, 3, 6, 12] }),
    icon: '📊',
    description: '连续控制预算',
    rarity: 'epic',
  },

  // 特殊
  {
    name: '完美一天',
    category: 'special',
    condition: JSON.stringify({ type: 'perfect_day', thresholds: [1, 3, 7, 30] }),
    icon: '🌟',
    description: '所有模块都有进展',
    rarity: 'legendary',
  },
  {
    name: '洞察收集者',
    category: 'special',
    condition: JSON.stringify({ type: 'insight_count', thresholds: [5, 20, 50, 100] }),
    icon: '💡',
    description: '累计洞察数量',
    rarity: 'epic',
  },
]

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
 * 分别检查各表是否为空，为空则插入对应种子数据
 * 幂等设计，可安全重复调用
 */
export async function seed() {
  // ====== 基础数据（目标、习惯） ======
  const goalCount = db.select({ value: count() }).from(goals).get()
  if (goalCount && goalCount.value === 0) {
    console.log('[seed] 目标表为空，写入种子数据...')

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
  }

  // ====== 徽章数据 ======
  const badgeCount = db.select({ value: count() }).from(badges).get()
  if (badgeCount && badgeCount.value === 0) {
    console.log('[seed] 徽章表为空，写入徽章种子数据...')
    const insertedBadges = db.insert(badges).values(badgeDefinitions).returning({ id: badges.id }).all()
    console.log(`[seed] 已创建 ${insertedBadges.length} 个徽章定义`)
  }

  console.log('[seed] 种子数据写入完成')
}
