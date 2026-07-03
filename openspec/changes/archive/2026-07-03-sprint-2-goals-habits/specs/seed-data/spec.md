## ADDED Requirements

### Requirement: 种子数据自动插入

系统 SHALL 在数据库为空时自动插入示例数据。

#### Scenario: 首次运行插入种子数据

- **WHEN** 应用启动且数据库无任何目标和习惯
- **THEN** 系统自动插入 3 个示例目标和 3 个示例习惯

#### Scenario: 已有数据时跳过

- **WHEN** 应用启动且数据库已有数据
- **THEN** 系统不插入任何数据

### Requirement: 示例目标

种子数据 SHALL 包含示例目标。

#### Scenario: 示例目标内容

- **WHEN** 种子数据插入
- **THEN** 创建以下目标：
  1. "储蓄目标"：目标值 10000，单位"元"
  2. "健康目标"：目标值 30，单位"kg"
  3. "学习目标"：目标值 12，单位"本"

### Requirement: 示例习惯

种子数据 SHALL 包含示例习惯。

#### Scenario: 示例习惯内容

- **WHEN** 种子数据插入
- **THEN** 创建以下习惯：
  1. "运动"：daily 频率
  2. "阅读"：daily 频率
  3. "冥想"：daily 频率

### Requirement: 示例打卡记录

种子数据 SHALL 包含示例打卡记录。

#### Scenario: 7 天打卡记录

- **WHEN** 种子数据插入
- **THEN** 为每个习惯创建过去 7 天的打卡记录，随机完成状态（约 70% 完成率）
