# Personal ERP

个人生活管理系统，整合财务记账、目标追踪、习惯打卡。

## 功能

- **目标追踪** - 创建/编辑/删除目标，进度追踪，趋势展示
- **习惯打卡** - 每日打卡，连续天数，打卡率统计
- **智能洞察** - 跨模块联动分析，自动生成洞察
- **Dashboard** - 统一展示，统计卡片，可视化进度
- **财务同步** - Actual Budget 数据同步（需配置服务器）

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
git clone https://github.com/EvilJul/Personal_ERP.git
cd Personal_ERP
npm install
```

### 配置

创建 `.env.local` 文件：

```env
APP_PASSWORD=your-password-here
SESSION_SECRET=your-secret-key-here

# 可选：Actual Budget 集成
ACTUAL_SERVER_URL=http://localhost:5006
ACTUAL_PASSWORD=your-actual-password
ACTUAL_BUDGET_ID=your-budget-id
```

### 运行

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

### 测试

```bash
# 单元测试
npm run test:unit

# 单元测试（监听模式）
npm run test:watch

# E2E 测试
npm run test:e2e

# 类型检查
npm run typecheck
```

## 技术栈

- **框架**: Next.js (App Router)
- **语言**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **数据库**: SQLite + Drizzle ORM
- **认证**: JWT (jose)
- **测试**: Vitest (单元/API) + Playwright (E2E)

## 项目结构

```
src/
├── app/              # Next.js 页面和 API Routes
├── components/       # React 组件
├── db/               # 数据库 schema 和查询
├── engine/           # Connection Engine
├── lib/              # 工具函数
└── middleware.ts     # 路由保护
```

## 许可证

MIT
