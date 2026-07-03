## ADDED Requirements

### Requirement: 习惯打卡

用户 SHALL 能够点击打卡按钮完成今日打卡。

#### Scenario: 成功打卡

- **WHEN** 用户点击习惯卡片上的打卡按钮
- **THEN** 系统调用 POST /api/habits/[id]/checkin，UI 立即更新为"已完成"状态，打卡按钮有 200ms scale 动画

#### Scenario: 重复打卡（幂等）

- **WHEN** 用户对已完成的习惯再次点击打卡
- **THEN** 系统不创建新记录，返回已有记录，UI 保持"已完成"状态

#### Scenario: 打卡失败回滚

- **WHEN** API 调用失败（网络错误、服务器错误）
- **THEN** 系统回滚 UI 状态到打卡前，显示错误提示

### Requirement: 打卡状态展示

系统 SHALL 展示习惯的今日打卡状态。

#### Scenario: 已打卡状态

- **WHEN** 习惯今日已打卡
- **THEN** 打卡按钮显示为"已完成"样式（绿色勾选），不可重复点击

#### Scenario: 未打卡状态

- **WHEN** 习惯今日未打卡
- **THEN** 打卡按钮显示为"未完成"样式（灰色圆圈），可点击

### Requirement: 连续打卡天数

系统 SHALL 展示习惯的连续打卡天数。

#### Scenario: 展示连续天数

- **WHEN** 用户查看习惯卡片
- **THEN** 系统显示连续打卡天数（如"已连续 5 天"）

#### Scenario: 连续中断

- **WHEN** 用户昨天未打卡
- **THEN** 连续天数重置为 0
