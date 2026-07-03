## ADDED Requirements

### Requirement: 规则评估引擎

系统 SHALL 实现 Connection Engine 规则评估引擎。

#### Scenario: 评估规则条件

- **WHEN** 调用 evaluateRules(moduleName)
- **THEN** 系统读取所有 enabled 的 connection_rules，检查每条规则的 rule_conditions 是否全部满足

#### Scenario: 条件满足时执行动作

- **WHEN** 规则的所有条件都满足
- **THEN** 系统执行该规则关联的所有 rule_actions

#### Scenario: 条件不满足时跳过

- **WHEN** 规则的任一条件不满足
- **THEN** 系统跳过该规则，不执行动作

### Requirement: 条件评估

系统 SHALL 支持多种条件运算符。

#### Scenario: 大于比较

- **WHEN** 条件运算符为 gt，且模块字段值大于比较值
- **THEN** 条件满足

#### Scenario: 小于比较

- **WHEN** 条件运算符为 lt，且模块字段值小于比较值
- **THEN** 条件满足

#### Scenario: 等于比较

- **WHEN** 条件运算符为 eq，且模块字段值等于比较值
- **THEN** 条件满足

### Requirement: 动作执行

系统 SHALL 支持生成洞察和调整目标两种动作。

#### Scenario: 生成洞察动作

- **WHEN** 动作类型为 generate_insight
- **THEN** 系统创建一条 insight 记录

#### Scenario: 调整目标动作

- **WHEN** 动作类型为 adjust_goal
- **THEN** 系统更新指定目标的 currentValue
