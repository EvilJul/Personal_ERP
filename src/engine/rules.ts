import { db } from '@/db'
import {
  connectionRules,
  ruleConditions,
  ruleActions,
  insights,
  goals,
  habits,
  habitEntries,
  accounts,
  transactions,
} from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

// 条件运算符映射
const operators: Record<string, (a: number, b: number) => boolean> = {
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
  gte: (a, b) => a >= b,
  lte: (a, b) => a <= b,
}

// 运算符中文映射
const operatorLabels: Record<string, string> = {
  gt: '超过',
  lt: '低于',
  eq: '等于',
  gte: '达到',
  lte: '低于',
}

// 模块字段中文映射
const fieldLabels: Record<string, string> = {
  total: '目标总数',
  completed: '已完成目标数',
  avg_progress: '平均进度',
  checked_in_today: '今日打卡数',
  completion_rate: '今日完成率',
  total_balance: '总余额',
  monthly_spending: '本月支出',
  account_count: '账户数',
  transaction_count: '本月交易数',
}

// 模块中文名
const moduleLabels: Record<string, string> = {
  goals: '目标',
  habits: '习惯',
  finance: '财务',
}

// Zod 校验规则条件结果
const ConditionResultSchema = z.object({
  field: z.string(),
  module: z.string(),
  operator: z.string(),
  value: z.string(),
  actualValue: z.number(),
  passed: z.boolean(),
})

type ConditionResult = z.infer<typeof ConditionResultSchema>

// 模块数据类型
type ModuleData = Record<string, number>

/**
 * 获取模块聚合数据
 * 根据模块名查询对应表，返回可被条件评估的数值字段
 */
async function getModuleData(module: string): Promise<ModuleData> {
  switch (module) {
    case 'goals': {
      // 查询目标聚合数据
      const allGoals = await db.select().from(goals)
      const totalGoals = allGoals.length
      const completedGoals = allGoals.filter(
        (g) => g.currentValue >= g.targetValue
      ).length
      const avgProgress =
        totalGoals > 0
          ? allGoals.reduce(
              (sum, g) => sum + (g.currentValue / g.targetValue) * 100,
              0
            ) / totalGoals
          : 0

      return {
        total: totalGoals,
        completed: completedGoals,
        avg_progress: Math.round(avgProgress * 100) / 100,
      }
    }

    case 'habits': {
      // 查询习惯及打卡数据
      const allHabits = await db.select().from(habits)
      const totalHabits = allHabits.length

      // 查询今日打卡情况
      const today = new Date().toISOString().split('T')[0]
      const todayEntries = await db
        .select()
        .from(habitEntries)
        .where(eq(habitEntries.date, today))

      const checkedInToday = todayEntries.filter((e) => e.completed === 1).length
      const completionRate =
        totalHabits > 0 ? (checkedInToday / totalHabits) * 100 : 0

      return {
        total: totalHabits,
        checked_in_today: checkedInToday,
        completion_rate: Math.round(completionRate * 100) / 100,
      }
    }

    case 'finance': {
      // 查询财务聚合数据
      const allAccounts = await db.select().from(accounts)
      const totalBalance = allAccounts.reduce((sum, a) => sum + a.balance, 0)

      // 查询本月交易
      const now = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const monthTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            // 交易日期 >= 本月第一天
            // Drizzle 没有 gte for text，使用简单过滤
          )
        )

      // 代码层面过滤本月交易
      const thisMonthTxns = monthTransactions.filter(
        (t) => t.date >= monthStart
      )
      const monthlySpending = thisMonthTxns
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        total_balance: Math.round(totalBalance * 100) / 100,
        monthly_spending: Math.round(monthlySpending * 100) / 100,
        account_count: allAccounts.length,
        transaction_count: thisMonthTxns.length,
      }
    }

    default:
      return {}
  }
}

/**
 * 根据规则名称和条件结果生成人类可读消息
 *
 * 策略：
 * 1. 如果规则有 description，优先使用（但会替换模板变量）
 * 2. 否则根据规则名称关键词 + 条件结果自动生成
 */
function generateInsightMessage(
  rule: { name: string; description: string | null },
  conditionResults: ConditionResult[],
  moduleData: ModuleData,
): string {
  // 如果有 description，尝试替换其中的模板变量
  if (rule.description) {
    let message = rule.description
    for (const cr of conditionResults) {
      const label = fieldLabels[cr.field] ?? cr.field
      message = message
        .replace(`{{${cr.module}.${cr.field}}}`, String(cr.actualValue))
        .replace(`{{${cr.field}}}`, String(cr.actualValue))
    }
    return message
  }

  // 根据条件结果自动生成消息
  if (conditionResults.length === 0) {
    return `规则「${rule.name}」已触发`
  }

  const parts: string[] = []
  for (const cr of conditionResults) {
    const fieldLabel = fieldLabels[cr.field] ?? cr.field
    const moduleLabel = moduleLabels[cr.module] ?? cr.module
    const opLabel = operatorLabels[cr.operator] ?? cr.operator

    // 根据字段类型格式化数值
    let valueStr = String(cr.actualValue)
    if (cr.field.includes('rate') || cr.field.includes('progress')) {
      valueStr = `${cr.actualValue}%`
    } else if (cr.field.includes('spending') || cr.field.includes('balance')) {
      valueStr = `¥${cr.actualValue.toLocaleString()}`
    }

    parts.push(`${moduleLabel}${fieldLabel} ${opLabel} ${valueStr}`)
  }

  if (parts.length === 1) {
    return parts[0]
  }
  return parts.join('；')
}

/**
 * 根据规则类型和条件结果判断 severity
 *
 * 策略：
 * - 超支 / 超限类 → warning
 * - 目标达成 / 完成率高 → success
 * - 其他 → info
 */
function determineSeverity(
  ruleName: string,
  conditionResults: ConditionResult[],
): 'info' | 'warning' | 'success' {
  const nameLower = ruleName.toLowerCase()

  // 关键词匹配：warning 场景
  const warningKeywords = ['超', '超过', '超出', '逾期', '延迟', '下降', '不足', '低于', 'warning', 'alert']
  if (warningKeywords.some((kw) => nameLower.includes(kw))) {
    return 'warning'
  }

  // 关键词匹配：success 场景
  const successKeywords = ['达成', '完成', '突破', '超过目标', 'success', '完成率']
  if (successKeywords.some((kw) => nameLower.includes(kw))) {
    return 'success'
  }

  // 根据条件结果推断
  for (const cr of conditionResults) {
    // 超支场景：spending 超过阈值
    if (cr.field.includes('spending') && (cr.operator === 'gt' || cr.operator === 'gte')) {
      return 'warning'
    }
    // 完成率低场景
    if (cr.field.includes('completion_rate') && (cr.operator === 'lt' || cr.operator === 'lte')) {
      return 'warning'
    }
    // 目标完成场景
    if (cr.field === 'completed' && (cr.operator === 'gt' || cr.operator === 'gte')) {
      return 'success'
    }
    // 平均进度高
    if (cr.field === 'avg_progress' && cr.operator === 'gte' && cr.actualValue >= 80) {
      return 'success'
    }
  }

  return 'info'
}

/**
 * 执行动作 - 生成洞察
 */
async function executeGenerateInsight(
  rule: { id: string; name: string; description: string | null },
  action: { parameters: string | null; type: string },
  conditionResults: ConditionResult[],
  moduleData: ModuleData,
): Promise<void> {
  // 基础 data 字段
  const data: Record<string, unknown> = {
    triggered: true,
    conditions: conditionResults.map((cr) => ({
      module: cr.module,
      field: cr.field,
      operator: cr.operator,
      expected: cr.value,
      actual: cr.actualValue,
    })),
  }

  // 合并 action.parameters 中的自定义数据
  if (action.parameters) {
    try {
      const parsed = JSON.parse(action.parameters)
      Object.assign(data, parsed)
    } catch {
      // 参数解析失败时使用默认数据
    }
  }

  const message = generateInsightMessage(rule, conditionResults, moduleData)
  const severity = determineSeverity(rule.name, conditionResults)

  await db.insert(insights).values({
    ruleId: rule.id,
    message,
    severity,
    data: JSON.stringify(data),
  })
}

/**
 * 执行动作 - 调整目标进度
 */
async function executeAdjustGoal(
  action: { parameters: string | null }
): Promise<void> {
  if (!action.parameters) return

  try {
    const params = JSON.parse(action.parameters) as {
      goalId?: string
      adjustment?: number
    }

    if (!params.goalId || params.adjustment === undefined) return

    // 查询目标
    const goal = await db
      .select()
      .from(goals)
      .where(eq(goals.id, params.goalId))
      .limit(1)

    if (goal.length === 0) return

    const newCurrentValue = goal[0].currentValue + params.adjustment

    // 更新目标进度
    await db
      .update(goals)
      .set({
        currentValue: Math.max(0, newCurrentValue), // 不允许负数
        updatedAt: new Date(),
      })
      .where(eq(goals.id, params.goalId))
  } catch {
    // 参数解析失败时静默处理
  }
}

/**
 * 执行动作
 */
async function executeAction(
  action: { type: string; parameters: string | null },
  rule: { id: string; name: string; description: string | null },
  conditionResults: ConditionResult[],
  moduleData: ModuleData,
): Promise<void> {
  switch (action.type) {
    case 'generate_insight':
      await executeGenerateInsight(rule, action, conditionResults, moduleData)
      break
    case 'adjust_goal':
      await executeAdjustGoal(action)
      break
    default:
      // 未知动作类型，跳过
      break
  }
}

/**
 * 主入口：评估指定模块的所有启用规则
 *
 * @param module - 模块名称：'habits' | 'goals' | 'finance'
 */
export async function evaluateRules(module: string): Promise<void> {
  // 查询所有启用的规则
  const enabledRules = await db
    .select()
    .from(connectionRules)
    .where(eq(connectionRules.enabled, 1))

  if (enabledRules.length === 0) return

  // 获取当前模块数据（只需查询一次）
  const moduleData = await getModuleData(module)

  for (const rule of enabledRules) {
    // 查询该规则的所有条件
    const conditions = await db
      .select()
      .from(ruleConditions)
      .where(eq(ruleConditions.ruleId, rule.id))

    if (conditions.length === 0) continue

    // 只评估包含当前模块相关条件的规则
    const relevantConditions = conditions.filter((c) => c.module === module)
    if (relevantConditions.length === 0) continue

    // 获取相关模块的数据来评估条件
    // 由于条件可能引用不同模块，需要获取所有相关模块数据
    const allModulesData: ModuleData = { ...moduleData }

    // 如果条件涉及其他模块，也需要获取其数据
    const otherModules = conditions
      .map((c) => c.module)
      .filter((m) => m !== module)
    for (const otherModule of new Set(otherModules)) {
      const otherData = await getModuleData(otherModule)
      // 使用前缀避免字段名冲突
      for (const [key, value] of Object.entries(otherData)) {
        allModulesData[`${otherModule}.${key}`] = value
      }
    }

    // 评估所有条件（ALL 必须满足才触发），同时收集每个条件的结果
    const conditionResults: ConditionResult[] = []
    let shouldTrigger = true

    for (const condition of conditions) {
      let actualValue: number | undefined
      if (condition.module === module) {
        actualValue = moduleData[condition.field]
      } else {
        actualValue = allModulesData[`${condition.module}.${condition.field}`]
      }

      const compareValue = Number(condition.value)
      const op = operators[condition.operator]
      const passed =
        actualValue !== undefined &&
        !isNaN(compareValue) &&
        op !== undefined &&
        op(actualValue, compareValue)

      conditionResults.push({
        field: condition.field,
        module: condition.module,
        operator: condition.operator,
        value: condition.value,
        actualValue: actualValue ?? 0,
        passed,
      })

      if (!passed) {
        shouldTrigger = false
      }
    }

    if (shouldTrigger) {
      // 查询并执行该规则的所有动作
      const actions = await db
        .select()
        .from(ruleActions)
        .where(eq(ruleActions.ruleId, rule.id))

      for (const action of actions) {
        await executeAction(action, rule, conditionResults, allModulesData)
      }
    }
  }
}
