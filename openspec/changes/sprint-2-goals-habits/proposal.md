## Why

Sprint 1 搭建了项目骨架和 API Routes，但 Dashboard 和管理页面使用的是静态空数据。用户无法创建、编辑或删除目标和习惯。Sprint 2 的目标是让 Goals 和 Habits 模块真正可用：完整的 CRUD UI + 打卡功能 + 种子数据。

## What Changes

- Goals 管理页面：创建/编辑/删除目标的完整表单 + 列表展示真实数据
- Habits 管理页面：创建/编辑/删除习惯的完整表单 + 列表展示真实数据
- 打卡功能：点击打卡按钮，调用 API，UI 实时更新
- Dashboard 接入真实数据：从 API 获取 Goals/Habits/Insights 数据展示
- 种子数据机制：首次运行时插入示例数据
- 修复 Review 发现的 INFORMATIONAL 问题（insights query 函数、frequency 枚举验证）

## Capabilities

### New Capabilities
- `goals-management`: 目标的完整 CRUD UI（创建表单、编辑表单、删除确认、列表展示）
- `habits-management`: 习惯的完整 CRUD UI（创建表单、编辑表单、删除确认、列表展示）
- `habit-checkin`: 习惯打卡功能（点击打卡、幂等处理、状态更新）
- `dashboard-data`: Dashboard 接入真实 API 数据（替换静态空数据）
- `seed-data`: 种子数据机制（首次运行插入示例数据）

### Modified Capabilities
- `database-schema`: 修复 frequency 字段枚举约束

## Impact

- 前端页面：src/app/goals/, src/app/habits/, src/app/page.tsx
- 组件：src/components/ 下的 goal-card, habit-card, goals-section, habits-section
- API 调用：前端需要调用 /api/goals, /api/habits, /api/habits/[id]/checkin
- 数据库：seed.ts 需要完善
- 查询函数：需要创建 src/db/queries/insights.ts
