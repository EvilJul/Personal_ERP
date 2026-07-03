# TODOS — Personal ERP

## ✅ 已完成

### Phase 1: 项目基础 (Sprint 1)
- ✅ Next.js 项目初始化 + TypeScript + Tailwind
- ✅ SQLite + Drizzle ORM + WAL 模式
- ✅ Auth 中间件 (JWT session)
- ✅ Dashboard 骨架页面
- ✅ API Routes 骨架

### Phase 2: CRUD 功能 (Sprint 2)
- ✅ Goals CRUD (创建/编辑/删除/列表)
- ✅ Habits CRUD + 打卡功能
- ✅ 种子数据机制
- ✅ Dashboard 接入真实数据

### Phase 3: 数据互通 (Sprint 3)
- ✅ Actual Budget 集成 (同步骨架)
- ✅ 通用规则引擎 (Connection Engine)
- ✅ Insights 生成 (消息 + severity)
- ✅ Dashboard 趋势数据

### P1 问题修复
- ✅ Settings UI 页面
- ✅ N+1 查询优化
- ✅ 打卡取消功能 (toggle)
- ✅ UTC 时区修复

### 安全修复
- ✅ JWT Secret 硬编码默认值
- ✅ Middleware JWT 签名验证
- ✅ Logout 端点
- ✅ 密码明文存储 (脱敏)

## ⏳ 待完成

### P2: 代码质量
- **What**: 修复 MEDIUM 级别问题
- **Why**: 提升代码质量和可维护性
- **Items**:
  - 错误消息中英文统一
  - linkedModules 字段清理或实现
  - DELETE 操作触发规则评估
  - 外键存在性校验
  - Actual Budget 连接超时配置

### Phase 4: E2E 测试
- **What**: 添加 Playwright E2E 测试覆盖核心用户流
- **Why**: 用户流跨越多组件，单元测试不够
- **Depends on**: UI 稳定
- **Status**: UI 已稳定，可以开始

### Phase 5: 多端同步
- **What**: 移动端快速记录 + 桌面端看全貌
- **Why**: 用户的 10x 愿景
- **Status**: 未来规划

### Phase 6: 实际数据接入
- **What**: 连接 Actual Budget 服务器，同步真实财务数据
- **Why**: 验证跨模块联动功能
- **Depends on**: 运行中的 Actual Budget 服务器
- **Status**: 需要用户配置环境变量
