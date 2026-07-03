## Context

Sprint 1 完成了项目骨架：Next.js + SQLite + Auth + API Routes + Dashboard 骨架。当前状态：
- 8 个 API Routes 已实现（goals CRUD, habits CRUD + checkin, insights, sync, settings）
- Dashboard 页面使用静态空数据
- 组件（goal-card, habit-card, insight-card）已创建但未接入真实数据
- 种子数据机制（seed.ts）存在但不完整

Sprint 2 需要将前端与 API 连接，实现完整的 CRUD 流程。

## Goals / Non-Goals

**Goals:**
- 用户可以通过 UI 创建、编辑、删除目标和习惯
- 用户可以点击打卡按钮完成习惯打卡
- Dashboard 展示真实数据（从 API 获取）
- 首次运行时有示例数据引导用户

**Non-Goals:**
- Connection Engine 规则评估（Sprint 3）
- Actual Budget 同步（Sprint 3）
- 趋势图表（sparkline 已有 SVG 实现，数据接入在 Sprint 3）
- 多用户支持
- 移动端原生应用

## Decisions

### 1. 数据获取方式：Server Components + fetch

**选择**: 使用 React Server Components 在服务端获取数据，通过 props 传递给客户端组件。

**理由**: 
- Next.js App Router 推荐的数据获取方式
- 避免客户端水合问题
- 减少客户端 JavaScript 量

**替代方案**: 
- 客户端 fetch + useState：需要 loading 状态管理，增加复杂度
- SWR/React Query：MVP 阶段过重

### 2. 表单处理：Server Actions

**选择**: 使用 Next.js Server Actions 处理表单提交。

**理由**:
- 与 Server Components 配合良好
- 类型安全
- 自动序列化

**替代方案**:
- API Route + fetch：需要手动管理请求/响应
- React Hook Form：MVP 阶段不需要复杂的表单库

### 3. 删除确认：简单 confirm()

**选择**: 使用浏览器原生 `confirm()` 进行删除确认。

**理由**:
- MVP 阶段足够
- 零额外代码
- 后续可替换为自定义 Modal

**替代方案**:
- shadcn/ui AlertDialog：需要额外组件，可作为后续优化

### 4. 打卡交互：乐观更新

**选择**: 点击打卡后立即更新 UI，后台调用 API。失败时回滚。

**理由**:
- 用户体验好，即时反馈
- 减少感知延迟
- API 调用是幂等的（同一天重复打卡不创建新记录）

**实现**:
```tsx
const handleCheckin = async () => {
  setCompleted(true)  // 乐观更新
  try {
    await fetch(`/api/habits/${habitId}/checkin`, { method: 'POST', body: JSON.stringify({ date: today }) })
  } catch {
    setCompleted(false)  // 回滚
  }
}
```

### 5. 种子数据策略

**选择**: 在数据库初始化时检查是否为空，如果是则插入示例数据。

**理由**:
- 首次运行有数据可看
- 不影响已有数据
- 示例数据帮助用户理解功能

**示例数据**:
- 3 个目标（储蓄、健康、学习）
- 3 个习惯（运动、阅读、冥想）
- 7 天打卡记录（随机完成状态）

## Risks / Trade-offs

### Risk 1: Server Actions 错误处理
**风险**: Server Actions 的错误处理不如 API Route 灵活。
**缓解**: 使用 try/catch 捕获错误，返回结构化错误对象。复杂场景回退到 API Route。

### Risk 2: 数据一致性
**风险**: 乐观更新可能导致 UI 与数据库不一致。
**缓解**: API 调用失败时回滚 UI 状态。打卡 API 是幂等的，重复调用安全。

### Risk 3: 种子数据污染
**风险**: 种子数据可能干扰用户的真实数据。
**缓解**: 只在数据库完全为空时插入。提供清除种子数据的命令。

### Risk 4: 表单验证
**风险**: 前端验证可能与后端 Zod 验证不一致。
**缓解**: 共享验证逻辑（Zod schema 可在前后端复用）。前端验证是 UX 优化，后端验证是安全保证。
