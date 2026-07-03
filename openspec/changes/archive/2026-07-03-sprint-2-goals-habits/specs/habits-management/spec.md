## ADDED Requirements

### Requirement: 创建习惯

用户 SHALL 能够通过表单创建新习惯。

#### Scenario: 成功创建习惯

- **WHEN** 用户填写名称、频率（daily/weekly），点击"创建"按钮
- **THEN** 系统调用 POST /api/habits，成功后跳转到习惯列表，显示新习惯

#### Scenario: 表单验证失败

- **WHEN** 用户提交空名称
- **THEN** 系统显示验证错误提示，不提交请求

### Requirement: 编辑习惯

用户 SHALL 能够编辑已有习惯。

#### Scenario: 成功编辑习惯

- **WHEN** 用户修改习惯名称或频率，点击"保存"
- **THEN** 系统调用 PUT /api/habits/[id]，成功后更新列表显示

### Requirement: 删除习惯

用户 SHALL 能够删除习惯。

#### Scenario: 确认删除

- **WHEN** 用户点击"删除"按钮
- **THEN** 系统弹出确认对话框，确认后调用 DELETE /api/habits/[id]，同时删除关联的打卡记录

### Requirement: 习惯列表展示

系统 SHALL 展示所有习惯的列表。

#### Scenario: 有习惯时展示列表

- **WHEN** 用户访问习惯管理页面
- **THEN** 系统从 GET /api/habits 获取数据，展示习惯卡片（名称、频率、打卡状态）

#### Scenario: 无习惯时展示空状态

- **WHEN** 用户访问习惯管理页面且无习惯
- **THEN** 系统展示空状态插图 + "创建第一个习惯" 按钮
