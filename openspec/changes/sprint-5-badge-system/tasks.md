## 1. 数据库 Schema

- [x] 1.1 在 src/db/schema.ts 添加 badges 表（id, name, category, condition, icon, description, rarity, tier）
- [x] 1.2 在 src/db/schema.ts 添加 user_badges 表（id, userId, badgeId, unlockedAt, progress）
- [x] 1.3 运行 npx drizzle-kit push 创建新表
- [x] 1.4 在 src/db/seed.ts 添加 10 个徽章定义数据

## 2. 徽章评估引擎

- [x] 2.1 创建 src/engine/badges.ts，实现 evaluateBadges(event) 函数
- [x] 2.2 实现目标里程碑检查（25%/50%/75%/100%）
- [x] 2.3 实现习惯连续打卡检查（3/7/14/30/60/100 天）
- [x] 2.4 实现财务里程碑检查
- [x] 2.5 在打卡成功后调用 evaluateBadges('habit_checkin')
- [x] 2.6 在目标更新后调用 evaluateBadges('goal_update')

## 3. API Routes

- [x] 3.1 创建 src/app/api/badges/route.ts（GET 获取所有徽章 + 用户解锁状态）
- [x] 3.2 创建 src/db/queries/badges.ts（查询函数）

## 4. UI 组件

- [x] 4.1 创建 src/components/badge-card.tsx（徽章卡片，4 级递进样式）
- [x] 4.2 创建 src/components/badges-section.tsx（Dashboard 徽章区域）
- [x] 4.3 创建 src/app/badges/page.tsx（徽章墙页面）
- [x] 4.4 更新 src/app/page.tsx，Dashboard 添加徽章区域

## 5. 动画效果

- [x] 5.1 实现解锁动画（scale + 光晕 + 粒子）
- [x] 5.2 实现等级提升动画
- [x] 5.3 实现庆祝效果（confetti）

## 6. 验证

- [x] 6.1 npm run typecheck 通过
- [x] 6.2 npm run build 通过
- [x] 6.3 npm run test:unit 通过
- [x] 6.4 npm run test:e2e 通过
