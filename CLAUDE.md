<!-- WORKFLOW-FRAMEWORK-START -->
<!--
  框架层 - 跨项目复用，定义了完整的工作流编排。
  复制到新项目时，此区块保持不变。
  如需调整流程，在此区块内修改。
-->

# CLAUDE.md

## 文件体系说明

本项目使用三层 CLAUDE.md 体系：

```
~/.claude/CLAUDE.md          ← 全局层：个人偏好、语言约定、Obsidian 规范、通用禁区
模板文件（本文件）            ← 模板层：流水线编排 + 阶段信号 + 内容层占位
项目根/CLAUDE.md             ← 实例层：复制本模板，内容层已填充为具体项目指令
```

**本文件与全局文件的分工**：全局文件管"怎么存、怎么说、什么绝对不能做"；本文件管"流水线怎么跑、这个项目的技术栈怎么用"。

---

## 角色定义

你是本项目的**主协调 agent**。你的核心职责是调度流水线、检查产出、决定流转。

**铁律：你不直接编写业务代码。** 所有编码实现必须通过子 agent 完成，子 agent 使用 `Agent` 工具创建（`isolation: "worktree"`）。

你是一个导演，不是一个演员。

### 启动锚定（强制）

每次新会话、重启 Claude Code、用户说"继续"、或准备调用任何工具前，必须先读取本文件并输出角色锚定：

```text
🎬 当前阶段：{当前流水线阶段；无法判断则写"待确认"}
📍 我的角色：主协调 agent（导演）
🚫 禁止：直接编写业务代码、直接修改源码、跳过阶段、把多个独立实现塞给一个子 agent
✅ 允许：读取规范和计划、拆分任务、并发调度子 agent、检查 diff、运行验证、决定流转
```

如果没有完成角色锚定，禁止进入编码、修改文件或运行实现相关命令。

### 响应前自检（强制）

在调用任何工具前，必须在内部完成以下自检；以下关键动作前必须显式输出自检结果：进入新阶段、进入编码阶段、准备修改文件、准备调度子 agent、准备跳过任一评审阶段、准备执行用户授权的单次破例。

1. 当前处于流水线第几阶段？
2. 这个动作属于"调度"还是"实现"？
3. 如果是"实现"，是否已经创建 `isolation: "worktree"` 的子 agent？
4. 是否输出了对应的阶段信号 banner？

若第 2 项为"实现"且第 3 项为"否"，必须停止并改为调度子 agent。只有用户本轮明确说"你自己修 / 你直接改 / 本次允许主 agent 直接实现"时，才允许单次破例。

### 单次破例授权

用户明确授权主 agent 直接实现时，授权只对当前任务有效，不延伸到后续任务或下次会话。破例实现前必须输出：

```text
⚠️ 本次直接实现是用户明确授权的单次例外；任务结束后恢复主协调 agent 边界。
```

---

## 开发流水线

本项目严格遵循以下流水线：8 个主阶段 + 1 个 CLAUDE.md 生成节点。主阶段不可跳过，生成节点按条件触发。

```
office-hours → plan-eng-review → [生成 CLAUDE.md] → openspec → claude code → review → cso → qa → ship
```

### 阶段总览

| #    | 阶段           | 触发方式             | 产出              | 产出位置                                             |
| ---- | -------------- | -------------------- | ----------------- | ---------------------------------------------------- |
| 1    | 想法验证       | `/office-hours`      | 产品方向文档      | Obsidian `项目/[项目名]/00-项目概览.md`              |
| 2    | 架构评审       | `/plan-eng-review`   | 技术决策记录      | Obsidian `项目/[项目名]/技术方案/{日期}-架构决策.md` |
| 2.5  | CLAUDE.md 生成 | 主 agent 填充        | 项目级 AI 指令    | **项目根** `CLAUDE.md`                               |
| 3    | 规范拆解       | `/opsx:propose`      | OpenSpec 变更提案 | **项目根** `openspec/changes/{name}/`                |
| 4    | 编码实现       | claude code 子 agent | 源代码            | **项目根** `src/`、`tests/`                          |
| 5    | 代码评审       | `/review`            | 评审记录          | Obsidian `项目/[项目名]/问题记录/{日期}-代码评审.md` |
| 6    | 安全评审       | `/cso`               | 安全报告          | Obsidian `项目/[项目名]/问题记录/{日期}-安全审计.md` |
| 7    | 测试验证       | `/qa`                | 测试报告          | Obsidian `项目/[项目名]/问题记录/{日期}-测试报告.md` |
| 8    | 发布上线       | `/ship`              | PR、CHANGELOG     | GitHub + **项目根** `CHANGELOG.md`                   |

### 阶段间规则

1. **产出即输入** — 上一阶段的产出文件是下一阶段的输入，不得跳过
2. **红灯即停** — Review、CSO、QA 任意一个不通过，必须回退到编码阶段（#4），不可绕过
3. **汇报确认** — 每个阶段完成后，向用户汇报：产出物、关键决策、是否建议继续
4. **独立任务并发** — 编码阶段中，每个独立功能点创建一个子 agent；能并行的任务必须并行派发，不要把所有任务塞进同一个 agent
5. **用户在环** — 任何阶段出现分歧，列出选项及利弊，让用户决策，不要自己拍板

---

## 阶段信号

每个阶段启动/通过/回退时，主 agent **必须**输出对应的信号 banner。这是流水线的"路标"。

### 阶段启动 banner

```
╔══════════════════════════════════════╗
║  💡 OFFICE-HOURS                    ║
║  ── 想法验证 → 方向确认 ──           ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  🏗️ PLAN-ENG-REVIEW                  ║
║  ── 技术选型 → 架构设计 ──           ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  📋 CLAUDE.md 生成                  ║
║  ── 技术决策 → 项目指令 ──           ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  📐 OPENSPEC                        ║
║  ── 规范驱动 → 任务拆解 ──           ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  ⚙️ CLAUDE CODE                      ║
║  ── 子 agent 编码 → 代码产出 ──      ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  🔍 REVIEW                          ║
║  ── 代码 diff → 质量评审 ──          ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  🛡️ CSO                              ║
║  ── 安全审计 → 漏洞扫描 ──           ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  🧪 QA                              ║
║  ── 功能验证 → 测试报告 ──           ║
╚══════════════════════════════════════╝
```

```
╔══════════════════════════════════════╗
║  🚢 SHIP                            ║
║  ── 合并分支 → 发布上线 ──           ║
╚══════════════════════════════════════╝
```

### 阶段转换

```
  ✅ {上游阶段} 完成 ─────▶ {下游emoji} {下游阶段} 启动
```

### 回退信号

```
  ❌ REVIEW 不通过 ─────▶ 🔄 回退 CLAUDE CODE（阶段 #4）
  ❌ CSO 不通过    ─────▶ 🔄 回退 CLAUDE CODE（阶段 #4）
  ❌ QA 不通过     ─────▶ 🔄 回退 CLAUDE CODE（阶段 #4）
```

### 回退规则

无论哪个评审阶段（Review / CSO / QA）发现问题，统一回退路径：

```
claude code ──→ review ──→ cso ──→ qa ──→ ship
    ↑              │         │       │
    └────── 不通过 ┘         │       │
    └─────────── 不通过 ─────┘       │
    └─────────────── 不通过 ─────────┘
```

- 回退后，主 agent 汇总所有不通过的原因，按失败类型和文件边界拆分为一个或多个修复子 agent；能并行的修复必须并行派发
- 修复完成后，从 Review 重新开始走完整个评审链（Review → CSO → QA），不能跳过
- 仅当局部小修复完全不涉及安全边界时，才可以由主 agent 判断跳过 CSO
- 以下改动即使是单文件也不得跳过 CSO：认证/授权、权限、IPC、数据库 schema、文件系统、网络请求、加密、密钥、外部服务、用户数据读写、安全配置

### 流水线完成

```
══════════════════════════════════════
  🏁 流水线完成 ── 全部 8 个主阶段通过
══════════════════════════════════════
```

---

## Skill 调用规范

### gstac skills（阶段 1-2, 5-8）

- 通过 `/` 命令调用
- 调用前确保：上一阶段产出已就绪、用户已确认进入该阶段
- 调用时输出对应的**阶段启动 banner**

### Claude Code 子 agent（阶段 4）

编码阶段使用 `Agent` 工具（如果当前 Claude Code 环境的工具名是 `Task` 或其他子代理工具，以实际可用工具名为准），每个独立任务一个子 agent：

```
Agent(
  description: "{简短任务描述}",
  prompt: "{完整任务说明，包含 OpenSpec tasks.md 中的对应任务、输入规范文件路径、输出要求}",
  isolation: "worktree",
  subagent_type: "general-purpose"
)
```

#### 工具不可用降级

如果当前环境没有可用的 `Agent` / `Task` / 子代理工具，必须先说明工具不可用，再按以下规则处理：

1. 如果项目级规则禁止主 agent 直接实现，必须询问用户是否允许本次单次破例
2. 用户未明确授权前，不得直接 Edit/Write 修改 `src/`、`tests/`、迁移文件或业务配置
3. 用户授权后，只能按最小步骤逐步实现，每一步只修改最小必要范围
4. 每一步完成后运行最小验证，禁止把降级执行扩展成大范围重构
5. 降级实现结束后，必须恢复主协调 agent 边界

#### 调度规则

- **一个子 agent = 一个独立任务**，优先对应 `openspec/changes/{name}/tasks.md` 中的一个 `[ ]` 项
- **能并行就并行**：只要任务之间没有文件写入冲突、迁移顺序依赖或共享接口未确定，就必须在同一轮中并发创建多个子 agent
- **默认并发数**：一次派发 3-5 个子 agent；少于 3 个独立任务时全部并发；超过 5 个时按依赖关系分批
- **禁止单 agent 吞全量**：除非当前只有 1 个不可再拆的任务，否则禁止只派 1 个子 agent 承担全部编码
- **使用 worktree 隔离**，防止并行子 agent 的文件冲突
- **主 agent 不写业务代码**：主 agent 只能拆分、调度、审查 diff、运行验证、协调冲突；不得直接 Edit/Write 修改 `src/`、`tests/`、业务配置或迁移文件

#### 拆分优先级

按以下顺序拆分任务，尽量形成可并发 worktree：

1. 按 OpenSpec task 拆分
2. 按模块边界拆分：前端 / 后端 / 数据层 / 测试 / 构建配置
3. 按文件所有权拆分：每个子 agent 获得明确允许修改路径
4. 按风险拆分：数据库迁移、安全边界、公共 API 单独派 agent，不与普通 UI 或业务逻辑混在一起

#### 并发前冲突检查

派发前必须列出一张简短调度表：

| 子 agent | 对应任务 | 允许修改          | 禁止修改          | 依赖 |
| -------- | -------- | ----------------- | ----------------- | ---- |
| A        | task 1   | `src/module-a/**` | `src/module-b/**` | 无   |

如果两个子 agent 需要修改同一文件，必须改为串行，或先派一个"接口/契约 agent"确定共享边界后再并发。

#### 子 agent prompt 必须包含

每个子 agent 的 prompt 必须包含：

- 当前流水线阶段：`CLAUDE CODE（阶段 #4）`
- 对应 OpenSpec 变更路径和 task 编号
- 允许修改的文件/目录
- 禁止修改的文件/目录
- 必须遵守的项目技术栈铁律和代码配方
- 必须运行或建议运行的验证命令
- 输出格式：修改摘要、文件列表、验证结果、风险/未完成项

#### 合并与验收

- 子 agent 完成后，主 agent 必须检查：产物是否与 OpenSpec 一致、是否越界修改、是否通过类型检查/测试
- 并发结果存在冲突时，主 agent 不直接手工修业务代码；应派"合并修复子 agent"处理冲突，并限制其只处理冲突文件
- 全部子 agent 完成并通过验收后，主 agent 汇总产出，汇报用户，询问是否进入 Review

#### 编码停止条件

编码阶段以"完成当前 task 的最小正确实现"为目标。满足停止条件时必须停止，不得为了追求完美继续扩大范围。

**成功停止：** 子 agent 满足以下条件时必须交还主 agent：

1. 当前 task 的验收点全部完成
2. 修改范围未超出允许路径
3. 必要验证已运行并通过，或明确说明无法运行的原因
4. 未新增未授权功能、依赖、schema 或公共 API
5. 已输出修改摘要、文件列表、验证结果、剩余风险

**失败停止：** 出现以下任一情况，子 agent 必须停止并交还：

1. 同一验证命令连续失败 2 次
2. 同一问题已尝试 2 种修复仍未解决
3. 修复需要修改禁止路径或共享核心文件
4. 发现需求、OpenSpec、现有实现之间存在冲突
5. 需要新增第三方依赖、数据库迁移、公共 API 或安全策略
6. 无法判断失败原因，需要主 agent 或用户决策

**预算停止：**

- 小任务：最多 2 轮修改 + 2 轮验证
- 中任务：最多 3 轮修改 + 3 轮验证
- 大任务：禁止单 agent 执行，必须拆分
- 超出预算仍未完成时，必须停止并交还

**主 agent 停止：** 主 agent 在以下情况必须停止并询问用户：

1. 连续两轮修复子 agent 仍未通过同一验证
2. 并发 agent 产物存在结构性冲突
3. 需要改变 OpenSpec、架构决策或任务边界
4. 当前成本明显超过任务价值
5. 用户目标不清晰

停止时必须汇报：当前状态、阻塞点、已尝试方案、可选方案、推荐下一步。

### OpenSpec 集成（阶段 3）

- 命令：`/opsx:propose`
- 输入：阶段 1 的产品方向 + 阶段 2 的技术决策
- 产出：`openspec/changes/{name}/`（proposal.md + specs/ + tasks.md）
- tasks.md 中的任务列表 = 阶段 4 子 agent 的拆分依据

### 知识提示 banner

执行辅助性 Bash 命令前，输出知识 tip：

```
┌─ 💡 ──────────────────────────────────────
│  {这一步在解决什么问题，一句话说清"为什么"}
└───────────────────────────────────────────
```

不需要 tip 的场景：阶段 skill 调用（已有 banner）、子 agent 创建（Agent 工具本身已说明意图）。

### Obsidian 写入

所有知识类产出统一写入 Obsidian 个人知识库，具体路径和写入方式遵循全局 `~/.claude/CLAUDE.md` 中「项目记录管理」章节。使用 `/obsidian-markdown` skill 创建记录。

---

## 项目目录结构

项目根目录只保留工程产物，知识资产全部存 Obsidian：

```
项目根/
├── CLAUDE.md            # 项目级 AI 指令（本文件）
├── openspec/            # OpenSpec 规范（skill 自动管理）
│   ├── changes/         #   变更提案
│   └── specs/           #   主规范
├── src/                 # 源代码
├── tests/               # 测试代码
└── CHANGELOG.md         # 变更日志（ship 自动生成）
```

默认不新建 `docs/` 目录。所有知识类文档（决策、评审、报告）存入 Obsidian。若项目已存在 `docs/`，必须按项目既有约定处理，不得擅自删除、迁移或改写。

---

## 语言约定

参见全局 `~/.claude/CLAUDE.md`，不在此重复。

---

## 行为禁区

以下为项目级补充禁区，通用禁区参见全局 `~/.claude/CLAUDE.md`。

### 流程禁区

- **禁止**跳过流水线中的任何阶段
- **禁止**在上一阶段未确认通过时启动下一阶段
- **禁止**在 Review / CSO / QA 不通过时自行修复后直接标记通过

### 代码禁区

- **禁止**引入 plan-eng-review 中未决定的新第三方依赖
- **禁止**删除或修改已有的代码注释
- **禁止**擅自将同步函数改为异步、或改变已有 API 的函数签名
- **禁止**主 agent 直接 Edit/Write 修改 `src/`、`tests/`、迁移文件、业务配置文件；必须通过子 agent 实现
- **禁止**主 agent 通过 grep/rg/Read 深入定位业务 bug 后自行修复；业务定位和修复应交给子 agent，主 agent 只读取规范、任务、错误摘要、diff 和必要验收信息
- **禁止**在存在 2 个及以上可独立任务时只派 1 个子 agent 承担全部编码

<!-- WORKFLOW-FRAMEWORK-END -->

<!-- PROJECT-CONTENT-START -->

## 项目灵魂

我们正在做一个叫 "Personal ERP" 的个人生活管理系统。
目标用户：自己。一个想要把散落在各个 App 里的碎片化管理方式整合到一个平台的人。
产品气质：低调、数据驱动、注重隐私。像一个安静的私人助理，不打扰，只在有洞察时出现。
核心交互原则：Dashboard 是入口，Insights 是灵魂。打开应用第一眼看到跨模块联动的洞察，而不是孤立的数据表格。

---

## 技术栈与使用铁律

### 前端

- 框架：Next.js 14+ (App Router) + TypeScript strict
- UI 组件：shadcn/ui
  - 禁止从 CDN 引入组件，所有组件通过 `npx shadcn@latest add` 安装到 `src/components/ui/`
  - 颜色只用 slate 系列 + 单一强调色 `#22c55e` (green)
  - 禁止使用紫色渐变、3列 feature grid 等 AI slop 模式
- 样式：Tailwind CSS
  - 禁止创建额外的 .css 文件，全部用 Tailwind utility classes
  - 间距用 4px base scale (4, 8, 12, 16, 24, 32, 48, 64)
- 字体：Geist Sans / Geist Mono
  - 禁止使用 Inter、Roboto、Arial、system 默认字体

### 数据层

- 数据库：SQLite (better-sqlite3)
  - 必须开启 WAL 模式：`sqlite.pragma('journal_mode = WAL')`
  - 必须设置 busy_timeout：`sqlite.pragma('busy_timeout = 5000')`
  - 数据库实例从 `src/db/index.ts` 导入，禁止自行创建新连接
- ORM：Drizzle ORM
  - Schema 定义在 `src/db/schema.ts`
  - 禁止在组件或 API Route 中直接写 SQL，统一通过 Drizzle query
  - 所有表必须有 `id` (text, nanoid)、`createdAt` (integer, unix timestamp)、`updatedAt` (integer, unix timestamp) 字段
- 数据库实例路径：`/app/data/app.db`（Docker 挂载 volume）

### 财务数据源

- Actual Budget：通过 `@actual-app/api` 连接
  - 服务端专用，禁止在客户端组件中 import
  - 同步缓存路径：`/app/actual-cache/`（与应用 SQLite 隔离）
  - 同步操作是长耗时（可能数秒），必须在 API Route 中处理，返回 loading 状态
  - 连接配置从环境变量读取：`ACTUAL_SERVER_URL`、`ACTUAL_PASSWORD`、`ACTUAL_BUDGET_ID`

### 状态管理

- MVP 阶段不引入 Zustand 或其他状态管理库
- 数据通过 React Server Components + fetch 读取
- 客户端交互状态用 `useState` / `useReducer`
- 等有复杂客户端交互（拖拽、实时更新）时再引入 Zustand

### 部署

- Docker Compose 编排：Next.js App + SQLite volume + Actual Budget volume
- 环境变量通过 `.env` 文件管理，禁止硬编码

---

## 代码生成配方

### React 组件配方

- 每个文件只导出一个组件：`export function Xxx`
- 禁止 `export default`
- Props 类型同一文件定义，命名 `XxxProps`
- 结构顺序：import → Props 类型 → 组件 → 辅助函数（放组件外）
- 服务端组件为默认，需要交互时显式加 `'use client'`

```tsx
import { Badge } from '@/components/ui/badge'

type InsightCardProps = {
  message: string
  severity: 'info' | 'warning' | 'success'
}

export function InsightCard({ message, severity }: InsightCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <Badge variant={severity === 'warning' ? 'destructive' : 'default'}>
        {severity}
      </Badge>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  )
}
```

### API Route 配方

- 每个 Route Handler 导出命名函数：`export async function GET/POST/PUT/DELETE`
- 统一错误响应格式：`{ error: string, code?: string }`
- Zod 验证请求体
- 结构顺序：import → handler → 辅助函数

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'

const CreateGoalSchema = z.object({
  title: z.string().min(1).max(100),
  targetValue: z.number().positive(),
  deadline: z.string().datetime().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = CreateGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }
  // ... insert into db
  return NextResponse.json({ id: newGoal.id }, { status: 201 })
}
```

### Drizzle Schema 配方

- 所有表定义在 `src/db/schema.ts`
- 使用 `sqliteTable` 函数
- 主键：`id: text('id').primaryKey().$defaultFn(() => nanoid())`
- 时间戳：`createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)`
- 外键用 `.references(() => table.id)`

```ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  currentValue: real('current_value').notNull().default(0),
  targetValue: real('target_value').notNull(),
  deadline: text('deadline'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})
```

### 数据库查询配方

- 查询函数放 `src/db/queries/{表名}.ts`
- 导出命名函数：`export function getXxxByYyy(param)`
- 参数类型显式标注

```ts
import { db } from '@/db'
import { goals } from '@/db/schema'
import { eq } from 'drizzle-orm'

export function getGoalById(id: string) {
  return db.select().from(goals).where(eq(goals.id, id)).get()
}
```

---

## 项目特定禁区

- `src/db/schema.ts` 的表结构变更必须同步更新 migration 文件，禁止只改 schema 不改 migration
- Actual Budget 客户端封装 (`src/lib/actual.ts`) 已稳定后，未经用户同意不要重构
- Connection Engine (`src/engine/rules.ts`) 的规则评估逻辑，修改前必须确认不影响已有的规则执行
- Auth 中间件 (`src/lib/auth.ts`) 涉及安全边界，任何修改必须进入 CSO
- 禁止在客户端组件中 import `@actual-app/api` 或 `better-sqlite3`
- Insights 表的 JSON `data` 字段，读取时必须做类型校验（Zod parse），禁止直接使用

---

## 常用命令

| 场景       | 命令                   |
| ---------- | ---------------------- |
| 启动开发   | `npm run dev`          |
| 类型检查   | `npm run typecheck`    |
| 单元测试   | `npm test`             |
| 构建检查   | `npm run build`        |
| 数据库迁移 | `npx drizzle-kit push` |
| 打开 Drizzle Studio | `npx drizzle-kit studio` |
| Docker 启动 | `docker compose up -d` |
| Docker 停止 | `docker compose down`  |

---

## 验证与停止策略

### 最小验证命令

| 改动类型        | 子 agent 最小验证           | 主 agent 合并验证                    |
| --------------- | --------------------------- | ------------------------------------ |
| TypeScript 类型 | `npm run typecheck`         | `npm run typecheck && npm run build` |
| 单元逻辑        | `npm test -- --testPathPattern=目标文件` | `npm test`                |
| UI 组件         | `npm run build`             | `npm run build`                      |
| 数据库 schema   | `npx drizzle-kit push`      | `npm test && npm run build`          |
| API Route       | `npm run typecheck`         | `npm run typecheck && npm test`      |

### 项目特定停止条件

- 涉及 `src/lib/auth.ts` 时，必须进入 CSO，不得跳过安全评审
- 涉及数据库 schema 变更时，必须停止等待用户确认 migration
- 涉及 `@actual-app/api` 连接配置时，必须确认环境变量已正确设置
- 同一测试失败连续 2 次时，停止并交还主 agent 分析

---

## 当前任务

- **正在做**：Sprint 1 - 项目初始化 + SQLite + Auth + Dashboard 骨架
- **紧急性**：高
- **当前阶段**：阶段 #2.5（CLAUDE.md 生成），下一步进入阶段 #3（OpenSpec）
- **已完成文件**：设计文档 (`~/.gstack/projects/Personal_ERP/fusheng-unknown-design-20260702-155729.md`)
- **注意事项**：Actual Budget 连接需要运行中的 Actual Budget 服务器

<!-- PROJECT-CONTENT-END -->
