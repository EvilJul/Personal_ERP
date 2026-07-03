## ADDED Requirements

### Requirement: 洞察生成

系统 SHALL 在规则触发时生成洞察记录。

#### Scenario: 生成洞察

- **WHEN** 规则条件满足并执行 generate_insight 动作
- **THEN** 系统创建一条 insight 记录，包含 message、severity、data

#### Scenario: 洞察消息生成

- **WHEN** 生成洞察
- **THEN** 系统根据规则和条件结果生成人类可读的消息

### Requirement: 洞察展示

系统 SHALL 在 Dashboard 展示洞察。

#### Scenario: 展示洞察列表

- **WHEN** 用户访问 Dashboard
- **THEN** 系统按 createdAt 降序展示洞察

#### Scenario: 首条洞察高亮

- **WHEN** 有多条洞察
- **THEN** 首条洞察高亮显示（左边框 3px green-500 + 浅绿背景）

#### Scenario: 无洞察时展示空状态

- **WHEN** 没有洞察记录
- **THEN** 展示"暂无洞察，先添加目标和习惯"提示

### Requirement: 洞察数据存储

系统 SHALL 存储洞察的附加数据。

#### Scenario: 存储 JSON 数据

- **WHEN** 生成洞察
- **THEN** 系统将条件评估结果存储在 insight.data 字段（JSON 格式）

#### Scenario: 读取时校验

- **WHEN** 读取 insight.data
- **THEN** 系统使用 Zod 校验数据类型安全
