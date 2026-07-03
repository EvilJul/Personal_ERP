# Database Schema Spec

## ADDED Requirements

### Requirement: users 表

系统 SHALL 维护一个 users 表存储用户设置。单用户系统只有一行记录。

#### Scenario: 创建用户设置

- **WHEN** 用户首次配置 Actual Budget 连接信息
- **THEN** 创建一条 users 记录，存储服务器地址、密码、预算 ID

#### Scenario: 读取用户设置

- **WHEN** 需要连接 Actual Budget
- **THEN** 从 users 表读取连接配置

### Requirement: goals 表

系统 SHALL 维护一个 goals 表存储用户定义的目标。每个目标 MUST 包含标题、目标值和当前进度。

#### Scenario: 创建目标

- **WHEN** 用户提交新目标（标题、目标值、截止日期）
- **THEN** 创建一条 goals 记录，currentValue 默认为 0

#### Scenario: 更新目标进度

- **WHEN** 用户手动更新进度或 Connection Engine 自动调整
- **THEN** 更新 currentValue 和 updatedAt

#### Scenario: 删除目标

- **WHEN** 用户删除目标
- **THEN** 删除 goals 记录，关联的 habit_entries 保留（不级联删除）

### Requirement: habits 表

系统 SHALL 维护一个 habits 表存储用户定义的习惯。每个习惯 MUST 包含名称和频率。

#### Scenario: 创建习惯

- **WHEN** 用户提交新习惯（名称、频率、关联目标）
- **THEN** 创建一条 habits 记录

#### Scenario: 删除习惯

- **WHEN** 用户删除习惯
- **THEN** 删除 habits 记录和所有关联的 habit_entries

### Requirement: habit_entries 表

系统 SHALL 维护一个 habit_entries 表存储习惯打卡记录。每条记录 MUST 关联一个习惯和日期。

#### Scenario: 打卡

- **WHEN** 用户点击打卡按钮
- **THEN** 创建一条 habit_entries 记录（habitId + date 唯一）

#### Scenario: 查询打卡历史

- **WHEN** Dashboard 展示习惯统计
- **THEN** 按日期范围查询 habit_entries，计算 streak

#### Scenario: 幂等打卡

- **WHEN** 用户对同一天同一习惯重复打卡
- **THEN** 不创建新记录，返回已有记录

### Requirement: connection_rules 表

系统 SHALL 维护一个 connection_rules 表存储连接引擎规则定义。每条规则 MUST 包含名称和启用状态。

#### Scenario: 创建规则

- **WHEN** 用户定义新的联动规则
- **THEN** 创建 connection_rules 记录

#### Scenario: 启用/禁用规则

- **WHEN** 用户切换规则状态
- **THEN** 更新 enabled 字段

### Requirement: rule_conditions 表

系统 SHALL 维护一个 rule_conditions 表存储规则触发条件。每条条件 MUST 关联一个规则并指定模块、字段、运算符和比较值。

#### Scenario: 添加条件

- **WHEN** 用户为规则添加触发条件
- **THEN** 创建 rule_conditions 记录，指定模块、字段、运算符、比较值

#### Scenario: 条件评估

- **WHEN** Connection Engine 评估规则
- **THEN** 检查所有 conditions 是否满足（AND 逻辑）

### Requirement: rule_actions 表

系统 SHALL 维护一个 rule_actions 表存储规则触发后的动作。每条动作 MUST 关联一个规则并指定动作类型。

#### Scenario: 添加动作

- **WHEN** 用户为规则添加触发动作
- **THEN** 创建 rule_actions 记录，指定动作类型和参数

#### Scenario: 执行动作

- **WHEN** 规则条件全部满足
- **THEN** 执行所有关联的 actions

### Requirement: insights 表

系统 SHALL 维护一个 insights 表存储连接引擎生成的洞察。每条洞察 MUST 包含消息和严重级别。

#### Scenario: 生成洞察

- **WHEN** 规则触发 generate_insight 动作
- **THEN** 创建 insights 记录，severity 根据规则类型决定

#### Scenario: 标记已读

- **WHEN** 用户查看洞察
- **THEN** 更新 read 字段为 1

#### Scenario: 查询洞察

- **WHEN** Dashboard 展示洞察
- **THEN** 按 createdAt 降序查询，优先展示未读

### Requirement: 通用字段规范

所有表 MUST 遵循通用字段规范。主键 MUST 使用 nanoid 生成的 text 类型。时间戳 MUST 使用 unix timestamp (integer 类型)。JSON 字段读取时 MUST 使用 Zod 校验类型安全。

#### Scenario: 主键生成

- **WHEN** 创建任何记录
- **THEN** 使用 nanoid 生成 text 类型主键

#### Scenario: 时间戳

- **WHEN** 创建或更新记录
- **THEN** 使用 unix timestamp (integer 类型)

#### Scenario: JSON 字段校验

- **WHEN** 读取 JSON 字段（linkedModules, parameters, data）
- **THEN** 使用 Zod 校验类型安全
