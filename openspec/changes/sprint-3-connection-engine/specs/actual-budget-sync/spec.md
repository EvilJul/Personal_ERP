## ADDED Requirements

### Requirement: Actual Budget 连接

系统 SHALL 支持连接 Actual Budget 服务器。

#### Scenario: 成功连接

- **WHEN** 用户配置 ACTUAL_SERVER_URL、ACTUAL_PASSWORD、ACTUAL_BUDGET_ID
- **THEN** 系统可以连接到 Actual Budget 服务器

#### Scenario: 连接失败

- **WHEN** Actual Budget 服务器不可用或配置错误
- **THEN** 系统返回明确的错误信息，不影响其他功能

### Requirement: 数据同步

系统 SHALL 支持从 Actual Budget 同步财务数据。

#### Scenario: 同步账户数据

- **WHEN** 用户触发同步操作
- **THEN** 系统拉取所有账户信息并存储到 accounts 表

#### Scenario: 同步交易数据

- **WHEN** 用户触发同步操作
- **THEN** 系统拉取最近 30 天的交易记录并存储到 transactions 表

#### Scenario: 同步进度反馈

- **WHEN** 同步操作进行中
- **THEN** 系统返回 loading 状态

### Requirement: 手动触发同步

系统 SHALL 支持手动触发同步操作。

#### Scenario: API 触发

- **WHEN** 用户调用 POST /api/sync
- **THEN** 系统开始同步流程

#### Scenario: UI 触发

- **WHEN** 用户点击 Dashboard 上的"同步"按钮
- **THEN** 系统调用同步 API 并显示进度
