## Context

Sprint 1-2 完成了项目骨架、CRUD、Auth、Dashboard。当前状态：
- 8 个数据库表已定义（goals, habits, habit_entries, connection_rules, rule_conditions, rule_actions, insights, users）
- API Routes 已实现
- Dashboard 展示静态数据（Goals/Habits 从 DB 读取，Insights 为空）

Sprint 3 需要实现数据互通的核心机制。

## Goals / Non-Goals

**Goals:**
- Connection Engine 可以评估规则并生成 Insights
- Actual Budget 数据可以同步到本地
- Dashboard 展示趋势数据（Goals 进度变化、Habits 打卡率）

**Non-Goals:**
- 实时同步（手动触发即可）
- 复杂的规则 DSL（使用简单的条件组合）
- 多数据源支持（只支持 Actual Budget）
- 财务数据分析（只存储原始数据）

## Decisions

### 1. Connection Engine 架构

**选择**: 事件驱动 + 即时评估

**实现流程**:
```
用户操作（打卡/更新目标/同步财务）
    ↓
触发 evaluateRules(moduleName)
    ↓
读取所有 enabled 的 connection_rules
    ↓
对每条规则，检查所有 rule_conditions
    ↓
如果所有条件满足，执行 rule_actions
    ↓
生成 insight 记录
```

**理由**:
- 简单直接，不需要消息队列
- 同步执行，结果立即可见
- MVP 阶段足够

**替代方案**:
- 后台定时任务：增加复杂度，延迟反馈
- 事件总线：过重

### 2. Actual Budget 集成方式

**选择**: 使用 @actual-app/api 库，手动触发同步

**实现**:
```ts
// src/lib/actual.ts
import ActualApi from '@actual-app/api'

export async function syncFromActual() {
  const api = new ActualApi({
    serverURL: process.env.ACTUAL_SERVER_URL,
    password: process.env.ACTUAL_PASSWORD,
    budgetId: process.env.ACTUAL_BUDGET_ID,
  })
  
  await api.connect()
  await api.downloadBudget()
  
  const accounts = await api.getAccounts()
  const transactions = await api.getTransactions(accountId, startDate, endDate)
  
  await api.shutdown()
  
  return { accounts, transactions }
}
```

**理由**:
- @actual-app/api 是官方库，稳定可靠
- 手动触发避免复杂的同步状态管理
- 同步是长耗时操作，在 API Route 中处理

**风险**:
- Actual Budget 服务器可能不可用 → 需要错误处理
- 同步可能很慢 → 返回 loading 状态

### 3. Insights 生成逻辑

**选择**: 硬编码 + 规则引擎混合

**MVP 阶段硬编码**:
```ts
// 直接在 evaluateRules 中实现
function generateInsight(rule, conditionsResult) {
  return {
    ruleId: rule.id,
    message: generateMessage(rule, conditionsResult),
    severity: determineSeverity(rule),
    data: conditionsResult,
  }
}
```

**后续扩展**: 通过 rule_actions 表定义生成逻辑

**理由**:
- MVP 阶段只有 1-2 条规则，硬编码更快
- 规则引擎的 actions 机制留作扩展点

### 4. 趋势数据计算

**选择**: 在 Dashboard 页面计算，不存储趋势数据

**实现**:
```ts
// 计算 Goals 进度变化（最近 7 天）
function computeGoalTrend(goalId: string) {
  // 从 goal_history 表读取（如果有的话）
  // 或者简单计算：当前值 vs 7 天前的值
}

// 计算 Habits 打卡率（最近 7 天）
function computeHabitStreak(habitId: string) {
  // 从 habit_entries 表计算连续打卡天数
}
```

**理由**:
- 不需要额外的存储
- 实时计算，数据始终最新
- 计算量小（单用户）

## Risks / Trade-offs

### Risk 1: Actual Budget 连接失败
**风险**: Actual Budget 服务器不可用或配置错误
**缓解**: 同步失败时返回明确错误信息，不影响其他功能

### Risk 2: 规则评估性能
**风险**: 规则数量增加后评估变慢
**缓解**: MVP 阶段规则少，性能不是问题。后续可以添加索引和缓存。

### Risk 3: 数据一致性
**风险**: 同步过程中数据可能不一致
**缓解**: 使用事务保证原子性。同步是全量替换，不是增量更新。
