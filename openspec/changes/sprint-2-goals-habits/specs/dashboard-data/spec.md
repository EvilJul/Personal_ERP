## ADDED Requirements

### Requirement: Dashboard 数据加载

Dashboard SHALL 从 API 获取真实数据展示。

#### Scenario: 正常加载

- **WHEN** 用户访问 Dashboard 页面
- **THEN** 系统并行调用 GET /api/goals, GET /api/habits, GET /api/insights，展示数据

#### Scenario: 数据为空

- **WHEN** 用户无目标、习惯或洞察
- **THEN** 各区域展示对应的空状态（插图 + 文案 + CTA）

### Requirement: Insights 区域

Dashboard SHALL 展示 Insights 区域。

#### Scenario: 有洞察时展示

- **WHEN** 系统有洞察数据
- **THEN** 展示洞察卡片列表，首条洞察高亮（左边框 3px green-500 + 浅绿背景）

#### Scenario: 无洞察时展示

- **WHEN** 系统无洞察数据
- **THEN** 展示"暂无洞察，先添加目标和习惯"提示

### Requirement: Goals 区域

Dashboard SHALL 展示 Goals 区域。

#### Scenario: 有目标时展示

- **WHEN** 用户有目标数据
- **THEN** 展示目标卡片（标题、进度条、截止日期），最多显示 3 个，附"查看全部"链接

#### Scenario: 无目标时展示

- **WHEN** 用户无目标
- **THEN** 展示空状态 + "创建第一个目标"按钮

### Requirement: Habits 区域

Dashboard SHALL 展示 Habits 区域。

#### Scenario: 有习惯时展示

- **WHEN** 用户有习惯数据
- **THEN** 展示习惯卡片（名称、打卡状态、连续天数），最多显示 3 个，附"查看全部"链接

#### Scenario: 无习惯时展示

- **WHEN** 用户无习惯
- **THEN** 展示空状态 + "创建第一个习惯"按钮
