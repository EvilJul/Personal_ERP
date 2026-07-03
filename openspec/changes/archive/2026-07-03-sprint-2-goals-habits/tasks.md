## 1. 种子数据机制

- [x] 1.1 完善 src/db/seed.ts，实现数据库为空时自动插入示例数据
- [x] 1.2 创建 3 个示例目标（储蓄、健康、学习）
- [x] 1.3 创建 3 个示例习惯（运动、阅读、冥想）
- [x] 1.4 创建过去 7 天的打卡记录（约 70% 完成率）
- [x] 1.5 在应用启动时调用 seed 函数（layout.tsx 或 API Route）

## 2. Goals 管理 UI

- [x] 2.1 创建 src/app/goals/new/page.tsx（创建目标表单页）
- [x] 2.2 创建 src/app/goals/[id]/edit/page.tsx（编辑目标表单页）
- [x] 2.3 创建 src/components/goal-form.tsx（目标表单组件，支持创建和编辑）
- [x] 2.4 更新 src/app/goals/page.tsx，从 API 获取真实数据
- [x] 2.5 更新 src/components/goal-card.tsx，添加编辑和删除按钮
- [x] 2.6 实现删除确认（使用 confirm()）

## 3. Habits 管理 UI

- [x] 3.1 创建 src/app/habits/new/page.tsx（创建习惯表单页）
- [x] 3.2 创建 src/app/habits/[id]/edit/page.tsx（编辑习惯表单页）
- [x] 3.3 创建 src/components/habit-form.tsx（习惯表单组件）
- [x] 3.4 更新 src/app/habits/page.tsx，从 API 获取真实数据
- [x] 3.5 更新 src/components/habit-card.tsx，实现打卡功能
- [x] 3.6 实现乐观更新 + 失败回滚

## 4. Dashboard 数据接入

- [x] 4.1 更新 src/app/page.tsx，从 API 获取 Goals/Habits/Insights 数据
- [x] 4.2 更新 src/components/goals-section.tsx，接收真实数据
- [x] 4.3 更新 src/components/habits-section.tsx，接收真实数据
- [x] 4.4 更新 src/components/insights-section.tsx，接收真实数据
- [x] 4.5 创建 src/db/queries/insights.ts（查询函数）

## 5. Bug 修复和改进

- [x] 5.1 修复 habits route 的 frequency 字段枚举验证（z.enum）
- [x] 5.2 创建 src/db/queries/insights.ts，保持数据访问层一致性
- [x] 5.3 统一 API 错误响应语言（中文用户消息 + 英文 code）

## 6. 验证

- [x] 6.1 运行 npm run typecheck 确认无类型错误
- [x] 6.2 运行 npm run build 确认构建成功
- [x] 6.3 启动 dev server，手动测试完整流程
