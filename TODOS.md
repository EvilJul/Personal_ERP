# TODOS — Personal ERP

## ✅ 已完成 (v0.2.0)

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

### P2 代码质量修复 (Sprint 4)
- ✅ 统一 API 错误消息为中文
- ✅ linkedModules 字段 Zod 校验
- ✅ DELETE 操作触发规则评估
- ✅ 外键存在性校验
- ✅ Actual Budget 连接超时配置

### E2E 测试 (Sprint 4)
- ✅ Playwright 测试框架搭建
- ✅ 登录流程测试（3 个用例）
- ✅ Goals CRUD 测试（5 个用例）
- ✅ Habits 打卡测试（6 个用例）
- ✅ Dashboard 展示测试（7 个用例）
- ✅ 35/35 测试全部通过

### UI 优化 (Sprint 5)
- ✅ Bold Modern 设计风格
- ✅ 统计卡片栏（目标进度、打卡率、连续天数、洞察）
- ✅ 圆环进度条组件
- ✅ 可扩展布局（Top 5 限制 + 搜索/筛选/分页）
- ✅ 动画系统（fadeInUp, stagger, checkBounce, progressFill）
- ✅ 卡片 hover 悬浮效果
- ✅ 渐变背景 + 渐变分隔线
- ✅ P0 密码加密 (AES-256-GCM)

## ⏳ 待完成

### Phase 5: 多端同步
- **What**: 移动端快速记录 + 桌面端看全貌
- **Why**: 用户的 10x 愿景
- **Status**: 未来规划

### Phase 6: 实际数据接入
- **What**: 连接 Actual Budget 服务器，同步真实财务数据
- **Why**: 验证跨模块联动功能
- **Depends on**: 运行中的 Actual Budget 服务器
- **Status**: 需要用户配置环境变量
