## Why

Sprint 1 和 Sprint 2 实现了基础框架和 CRUD 功能，但 Personal ERP 的核心价值"数据互通"还没有实现。目前 Goals、Habits、Finance 是孤立的模块，没有联动。Sprint 3 的目标是实现 Connection Engine，让数据产生洞察：当支出超过预算时自动调整储蓄目标进度，当习惯打卡率高时生成正面反馈。

## What Changes

- Connection Engine 规则评估：读取 connection_rules + rule_conditions + rule_actions，评估条件并执行动作
- Actual Budget 同步：通过 @actual-app/api 拉取财务数据，写入本地缓存
- Insights 生成：规则触发时创建 insight 记录，Dashboard 展示
- 首条 Insight 高亮：Dashboard 展示洞察时，首条高亮（左边框 3px green-500）
- 趋势数据：计算 Goals 进度变化趋势，Habits 打卡率趋势

## Capabilities

### New Capabilities
- `connection-engine`: 规则评估引擎，读取规则定义，评估条件，执行动作
- `actual-budget-sync`: Actual Budget 数据同步，拉取账户和交易数据
- `insights-generation`: 洞察生成，规则触发时创建 insight 记录

### Modified Capabilities
- `database-schema`: 添加 finance 相关表（accounts, transactions）

## Impact

- 新增：src/engine/rules.ts（规则评估逻辑）
- 新增：src/lib/actual.ts（Actual Budget 客户端封装）
- 新增：src/db/schema.ts（finance 表）
- 修改：src/app/api/sync/route.ts（实现同步逻辑）
- 修改：src/app/page.tsx（展示趋势数据）
