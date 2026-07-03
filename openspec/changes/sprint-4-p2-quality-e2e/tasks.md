## 1. P2 代码质量修复

- [x] 1.1 统一 API 错误消息为中文
- [x] 1.2 清理 linkedModules 字段
- [x] 1.3 DELETE /api/goals/[id] 触发规则评估
- [x] 1.4 DELETE /api/habits/[id] 触发规则评估
- [x] 1.5 CreateHabitSchema 外键存在性校验
- [x] 1.6 Actual Budget 连接 30 秒超时

## 2. E2E 测试框架搭建

- [x] 2.1 安装 Playwright 依赖
- [x] 2.2 创建 playwright.config.ts
- [x] 2.3 创建 tests/e2e/ 目录结构

## 3. E2E 测试用例

- [x] 3.1 登录流程测试（3 个用例）
- [x] 3.2 Goals CRUD 测试（5 个用例）
- [x] 3.3 Habits 打卡测试（6 个用例）
- [x] 3.4 Dashboard 展示测试（7 个用例）
- [x] 3.5 Settings 页面测试

## 4. 验证

- [x] 4.1 npm run typecheck 通过
- [x] 4.2 npm run build 通过
- [x] 4.3 npx playwright test 通过（35/35）
