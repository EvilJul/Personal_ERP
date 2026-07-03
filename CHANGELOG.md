# Changelog

## [0.1.0] - 2026-07-03

### Added
- 认证系统：JWT session + 登录/登出 + Middleware 验证
- Goals CRUD：创建/编辑/删除目标 + 进度追踪 + 趋势展示
- Habits CRUD：创建/编辑/删除习惯 + 打卡（toggle）+ 连续天数
- Dashboard：统一展示层 + Insights/Goals/Habits 数据 + 趋势
- Connection Engine：规则评估引擎 + 条件判断 + 动作执行
- Actual Budget 集成：同步骨架 + 账户/交易数据拉取
- Insights 生成：消息生成 + severity 判断 + Zod 校验
- Settings UI：Actual Budget 连接配置页面
- 种子数据：首次运行自动插入示例数据
- 响应式布局：桌面双栏 + 平板单栏 + 移动端底部导航

### Fixed
- JWT Secret 硬编码默认值（改为必须配置环境变量）
- Middleware JWT 签名验证
- N+1 查询优化（Dashboard habits）
- UTC 时区问题（改为本地日期）
- 错误消息中英文统一
- Cookie 设置问题（JWT session）

### Security
- SESSION_SECRET 环境变量强制要求
- Middleware 完整 JWT 验证
- 密码比较使用 timingSafeEqual
- Settings API 密码脱敏
- .env 加入 .gitignore
