## 1. P2 代码质量修复

- [x] 1.1 统一 API 错误消息为中文（goals/[id], habits/[id], insights, settings）
- [x] 1.2 清理 linkedModules 字段（删除或添加 Zod 校验）
- [x] 1.3 DELETE /api/goals/[id] 触发 evaluateRules('goals')
- [x] 1.4 DELETE /api/habits/[id] 触发 evaluateRules('habits')
- [x] 1.5 CreateHabitSchema 添加 linkedGoalId 外键存在性校验
- [x] 1.6 Actual Budget 连接添加 30 秒超时

## 2. E2E 测试框架搭建

- [ ] 2.1 安装 Playwright 依赖
- [ ] 2.2 创建 playwright.config.ts
- [ ] 2.3 创建 tests/e2e/ 目录结构

## 3. E2E 测试用例

- [ ] 3.1 登录流程测试（输入密码 → 登录成功 → Dashboard 展示）
- [ ] 3.2 Goals CRUD 测试（创建 → 列表展示 → 编辑 → 删除）
- [ ] 3.3 Habits CRUD + 打卡测试（创建 → 打卡 → 取消打卡 → 删除）
- [ ] 3.4 Dashboard 数据展示测试（Goals/Habits/Insights 区域）
- [ ] 3.5 Settings 页面测试（加载配置 → 保存）

## 4. 验证

- [ ] 4.1 npm run typecheck 通过
- [ ] 4.2 npm run build 通过
- [ ] 4.3 npx playwright test 通过
