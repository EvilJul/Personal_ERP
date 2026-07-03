## ADDED Requirements

### Requirement: E2E 测试框架

系统 SHALL 使用 Playwright 进行 E2E 测试。

#### Scenario: 安装和配置

- **WHEN** 运行 npm install
- **THEN** Playwright 依赖安装成功，playwright.config.ts 配置正确

#### Scenario: 运行测试

- **WHEN** 运行 npx playwright test
- **THEN** 所有测试用例执行通过

### Requirement: 核心用户流测试

系统 SHALL 覆盖核心用户流的 E2E 测试。

#### Scenario: 登录流程

- **WHEN** 用户输入正确密码并点击登录
- **THEN** 跳转到 Dashboard，页面正常展示

#### Scenario: Goals CRUD

- **WHEN** 用户创建、编辑、删除目标
- **THEN** 操作成功，列表正确更新

#### Scenario: Habits 打卡

- **WHEN** 用户创建习惯、打卡、取消打卡
- **THEN** 状态正确切换，数据持久化
