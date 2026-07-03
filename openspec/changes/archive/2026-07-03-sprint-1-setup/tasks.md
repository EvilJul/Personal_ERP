# Sprint 1 Tasks

## 任务清单

- [ ] **Task 1: Next.js 项目初始化**
  - 创建 Next.js 14+ App Router 项目
  - 配置 TypeScript strict mode
  - 配置 Tailwind CSS
  - 配置 Geist 字体
  - 验证：`npm run dev` 可启动，`npm run typecheck` 通过

- [ ] **Task 2: SQLite + Drizzle ORM 数据层**
  - 安装 better-sqlite3 + drizzle-orm + drizzle-kit
  - 创建 `src/db/schema.ts`（所有表定义）
  - 创建 `src/db/index.ts`（数据库连接，WAL 模式）
  - 创建 `src/db/seed.ts`（种子数据机制）
  - 配置 drizzle-kit（drizzle.config.ts）
  - 验证：`npx drizzle-kit push` 成功，数据库可读写

- [ ] **Task 3: Auth 中间件**
  - 创建 `src/lib/auth.ts`（密码验证 + Cookie 管理）
  - 创建 Next.js middleware.ts（路由保护）
  - 创建登录页面 `/login`
  - 环境变量：`APP_PASSWORD`
  - 验证：未登录访问 Dashboard 被重定向到 /login

- [ ] **Task 4: Dashboard 骨架页面**
  - 创建 `src/app/page.tsx`（Dashboard 主页面）
  - 创建 `src/app/layout.tsx`（根布局 + 字体）
  - 集成 shadcn/ui 组件
  - 创建 Insights / Goals / Habits 三个区域的骨架组件
  - 响应式布局：桌面双栏 + 平板单栏
  - 验证：Dashboard 页面可渲染，响应式正常

- [ ] **Task 5: API Routes 骨架**
  - 创建 `/api/goals/route.ts`（CRUD 骨架）
  - 创建 `/api/habits/route.ts`（CRUD 骨架）
  - 创建 `/api/insights/route.ts`（读取骨架）
  - 创建 `/api/sync/route.ts`（同步骨架）
  - 创建 `/api/settings/route.ts`（设置骨架）
  - 验证：所有 API Route 返回 200 或合适的错误码

- [ ] **Task 6: Drizzle Schema 定义**
  - 定义 `users` 表（settings）
  - 定义 `goals` 表
  - 定义 `habits` 表
  - 定义 `habit_entries` 表
  - 定义 `connection_rules` 表
  - 定义 `rule_conditions` 表
  - 定义 `rule_actions` 表
  - 定义 `insights` 表
  - 验证：`npx drizzle-kit push` 成功

## 依赖关系

```
Task 1 (项目初始化)
    ↓
Task 2 (SQLite + Drizzle) ← Task 6 (Schema 定义)
    ↓
Task 3 (Auth) ← Task 1
    ↓
Task 4 (Dashboard) ← Task 1, Task 3
    ↓
Task 5 (API Routes) ← Task 2, Task 6
```

## 并发策略

- **Lane A**: Task 1 → Task 2 → Task 6 (串行，共享项目配置)
- **Lane B**: Task 3 (依赖 Task 1，可与 Lane A 后半段并行)
- **Lane C**: Task 4 (依赖 Task 1 + Task 3)
- **Lane D**: Task 5 (依赖 Task 2 + Task 6)

## 验收命令

```bash
npm run typecheck  # 全部 Task
npm run build      # 全部 Task
npm test           # Task 2, 3, 5, 6
```
