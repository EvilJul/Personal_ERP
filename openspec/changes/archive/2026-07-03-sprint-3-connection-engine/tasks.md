## 1. Finance 数据表

- [x] 1.1 在 src/db/schema.ts 添加 accounts 表（id, name, type, balance, syncId, createdAt, updatedAt）
- [x] 1.2 在 src/db/schema.ts 添加 transactions 表（id, accountId, amount, date, payee, category, syncId, createdAt）
- [x] 1.3 运行 npx drizzle-kit push 创建新表

## 2. Actual Budget 集成

- [x] 2.1 安装 @actual-app/api 依赖
- [x] 2.2 创建 src/lib/actual.ts，实现连接和同步逻辑
- [x] 2.3 实现 syncAccounts() 函数，拉取账户数据
- [x] 2.4 实现 syncTransactions() 函数，拉取最近 30 天交易
- [x] 2.5 更新 src/app/api/sync/route.ts，调用同步函数
- [x] 2.6 添加错误处理：连接失败、超时、配置错误

## 3. Connection Engine

- [x] 3.1 创建 src/engine/rules.ts，实现 evaluateRules(moduleName) 函数
- [x] 3.2 实现条件评估逻辑（gt, lt, eq, gte, lte）
- [x] 3.3 实现动作执行逻辑（generate_insight, adjust_goal）
- [x] 3.4 在打卡成功后调用 evaluateRules('habits')
- [x] 3.5 在目标更新后调用 evaluateRules('goals')
- [x] 3.6 在同步完成后调用 evaluateRules('finance')

## 4. Insights 生成

- [x] 4.1 改进 src/engine/rules.ts 的 generateInsight() 函数
- [x] 4.2 实现消息生成逻辑，根据规则类型生成人类可读消息
- [x] 4.3 实现 severity 判断逻辑（info, warning, success）
- [x] 4.4 在 src/db/queries/insights.ts 添加 Zod 校验 data 字段

## 5. Dashboard 趋势数据

- [x] 5.1 实现 computeGoalTrend() 函数，计算目标进度变化
- [x] 5.2 实现 computeHabitStreak() 函数，计算连续打卡天数
- [x] 5.3 更新 src/app/page.tsx，传递趋势数据给组件
- [x] 5.4 更新 src/components/goal-card.tsx，展示进度变化趋势
- [x] 5.5 更新 src/components/habit-card.tsx，展示打卡率趋势

## 6. 验证

- [x] 6.1 运行 npm run typecheck 确认无类型错误
- [x] 6.2 运行 npm run build 确认构建成功
- [x] 6.3 启动 dev server，手动测试同步和规则评估
