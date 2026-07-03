## Why

用户完成目标、坚持打卡、控制支出时，需要正向反馈激励。徽章系统提供游戏化的成就体验，参考 Duolingo/Nike Run Club/Strava 的设计风格，用 4 级递进（铜→银→金→钻石）增加用户粘性。

## What Changes

- 新增 badges 表（徽章定义）和 user_badges 表（用户解锁记录）
- 新增徽章评估引擎，在打卡/目标更新时检查是否解锁
- 新增 /api/badges API
- 新增 Dashboard 徽章区域
- 新增 /badges 徽章墙页面
- 解锁动画效果

## Capabilities

### New Capabilities
- `badge-system`: 徽章定义、解锁逻辑、展示、动画
- `badge-evaluation`: 徽章评估引擎，在关键事件后检查解锁条件

### Modified Capabilities
- `database-schema`: 新增 badges + user_badges 表

## Impact

- 新增：src/db/schema.ts（badges, user_badges 表）
- 新增：src/engine/badges.ts（徽章评估引擎）
- 新增：src/app/api/badges/route.ts
- 新增：src/app/badges/page.tsx
- 新增：src/components/badge-card.tsx
- 修改：src/app/page.tsx（Dashboard 添加徽章区域）
- 修改：打卡/目标更新后触发徽章检查
