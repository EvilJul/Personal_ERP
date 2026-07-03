# TODOS — Personal ERP

## Phase 2: Actual Budget 集成
- **What**: 集成 Actual Budget 作为财务数据源
- **Why**: 跨模块联动的核心数据来源，支出→目标影响需要财务数据
- **Depends on**: Phase 1 Goals + Habits tracker 跑通并日常使用
- **Risks**: @actual-app/api 文档稀少，有破坏性变更，同步本质是数据库复制

## Phase 2: 通用规则引擎
- **What**: 将 if-else 规则提取为可配置的规则引擎
- **Why**: 当有 3+ 条规则时，if-else 维护成本上升
- **Depends on**: 至少 3 条规则在生产中运行

## Phase 2: E2E 测试
- **What**: 添加 Playwright E2E 测试覆盖核心用户流
- **Why**: 用户流跨越多组件，单元测试不够
- **Depends on**: UI 稳定

## 未来: 多端同步
- **What**: 移动端快速记录 + 桌面端看全貌
- **Why**: 用户的 10x 愿景
