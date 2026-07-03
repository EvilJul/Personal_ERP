## ADDED Requirements

### Requirement: 创建目标

用户 SHALL 能够通过表单创建新目标。

#### Scenario: 成功创建目标

- **WHEN** 用户填写标题、目标值，点击"创建"按钮
- **THEN** 系统调用 POST /api/goals，成功后跳转到目标列表，显示新目标

#### Scenario: 表单验证失败

- **WHEN** 用户提交空标题或负数目标值
- **THEN** 系统显示验证错误提示，不提交请求

### Requirement: 编辑目标

用户 SHALL 能够编辑已有目标。

#### Scenario: 成功编辑目标

- **WHEN** 用户修改目标标题或目标值，点击"保存"
- **THEN** 系统调用 PUT /api/goals/[id]，成功后更新列表显示

### Requirement: 删除目标

用户 SHALL 能够删除目标。

#### Scenario: 确认删除

- **WHEN** 用户点击"删除"按钮
- **THEN** 系统弹出确认对话框，确认后调用 DELETE /api/goals/[id]

#### Scenario: 取消删除

- **WHEN** 用户点击"删除"后选择"取消"
- **THEN** 系统不执行删除操作

### Requirement: 目标列表展示

系统 SHALL 展示所有目标的列表。

#### Scenario: 有目标时展示列表

- **WHEN** 用户访问目标管理页面
- **THEN** 系统从 GET /api/goals 获取数据，展示目标卡片（标题、进度条、截止日期）

#### Scenario: 无目标时展示空状态

- **WHEN** 用户访问目标管理页面且无目标
- **THEN** 系统展示空状态插图 + "创建第一个目标" 按钮
