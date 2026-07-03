## Why

v0.1.0 发布后，代码审查发现 7 个 MEDIUM 级别问题和 5 个 LOW 级别问题。这些问题不影响功能但影响代码质量和可维护性。同时缺少 E2E 测试覆盖核心用户流。Sprint 4 目标：修复 P2 问题 + 添加 Playwright E2E 测试。

## What Changes

- 统一 API 错误消息为中文
- 清理或实现 linkedModules 字段
- DELETE 操作触发规则评估
- 外键存在性校验
- Actual Budget 连接超时配置
- Playwright E2E 测试覆盖核心用户流

## Capabilities

### New Capabilities
- `e2e-testing`: Playwright E2E 测试框架 + 核心用户流测试

### Modified Capabilities
- `api-error-handling`: 统一错误消息
- `connection-engine`: DELETE 触发规则
- `actual-budget-sync`: 连接超时

## Impact

- 修改：src/app/api/ 多个路由文件
- 修改：src/engine/rules.ts
- 修改：src/lib/actual.ts
- 新增：tests/e2e/ 目录
- 新增：playwright.config.ts
