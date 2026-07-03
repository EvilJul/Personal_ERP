## ADDED Requirements

### Requirement: 徽章定义表

系统 SHALL 维护一个 badges 表存储徽章定义。

#### Scenario: 创建徽章

- **WHEN** 系统初始化
- **THEN** 创建 10 个徽章定义，每个徽章有 4 个等级（铜/银/金/钻石）

#### Scenario: 徽章属性

- **WHEN** 查询徽章
- **THEN** 返回 name, category, condition, icon, description, rarity

### Requirement: 用户徽章表

系统 SHALL 维护一个 user_badges 表存储用户解锁记录。

#### Scenario: 解锁徽章

- **WHEN** 用户满足解锁条件
- **THEN** 创建 user_badges 记录，记录 unlockedAt 和当前等级

#### Scenario: 等级提升

- **WHEN** 用户满足更高等级条件
- **THEN** 更新 user_badges 记录的 tier 字段

### Requirement: 徽章评估引擎

系统 SHALL 在关键事件后自动评估徽章解锁条件。

#### Scenario: 打卡后评估

- **WHEN** 用户完成打卡
- **THEN** 系统调用 evaluateBadges('habit_checkin') 检查连续打卡徽章

#### Scenario: 目标更新后评估

- **WHEN** 用户更新目标进度
- **THEN** 系统调用 evaluateBadges('goal_update') 检查目标里程碑徽章

### Requirement: 徽章展示

系统 SHALL 在 Dashboard 和徽章墙页面展示徽章。

#### Scenario: Dashboard 展示

- **WHEN** 用户访问 Dashboard
- **THEN** 展示最近解锁的 3 个徽章 + "查看全部" 链接

#### Scenario: 徽章墙页面

- **WHEN** 用户访问 /badges
- **THEN** 展示所有徽章，按类别分组，已解锁/未解锁状态

### Requirement: 解锁动画

系统 SHALL 在徽章解锁时播放庆祝动画。

#### Scenario: 解锁动画

- **WHEN** 用户解锁新徽章
- **THEN** 播放 scale + 光晕 + 粒子动画

#### Scenario: 等级提升动画

- **WHEN** 用户徽章等级提升
- **THEN** 播放徽章变形动画 + confetti 庆祝
