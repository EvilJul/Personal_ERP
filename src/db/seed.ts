import { db } from './index'
import { goals, habits, connectionRules } from './schema'

/**
 * 种子数据脚本
 * 用法: npx tsx src/db/seed.ts
 */
function seed() {
  console.log('开始写入种子数据...')

  // 示例目标
  const sampleGoals = [
    {
      title: '每月储蓄 5000 元',
      description: '通过控制支出和增加收入实现储蓄目标',
      targetValue: 5000,
      unit: '元/月',
      linkedModules: JSON.stringify(['finance']),
    },
    {
      title: '每周运动 3 次',
      description: '保持健康的生活方式',
      targetValue: 3,
      currentValue: 0,
      unit: '次/周',
      linkedModules: JSON.stringify(['habits']),
    },
  ]

  for (const goal of sampleGoals) {
    db.insert(goals).values(goal).run()
  }
  console.log(`已创建 ${sampleGoals.length} 个示例目标`)

  // 示例习惯
  const sampleHabits = [
    { title: '晨间跑步', description: '每天早上跑步 30 分钟', frequency: 'daily' },
    { title: '阅读', description: '每天阅读 30 分钟', frequency: 'daily' },
    { title: '复盘周记', description: '每周日写复盘总结', frequency: 'weekly' },
  ]

  for (const habit of sampleHabits) {
    db.insert(habits).values(habit).run()
  }
  console.log(`已创建 ${sampleHabits.length} 个示例习惯`)

  // 示例连接规则
  db.insert(connectionRules).values({
    name: '储蓄进度提醒',
    description: '当本月储蓄达到目标 80% 时生成洞察',
    enabled: 1,
  }).run()
  console.log('已创建 1 个示例连接规则')

  console.log('种子数据写入完成')
}

seed()
