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

## [0.3.0] - 2026-07-03

### Added
- 统计卡片栏：目标进度、打卡率、连续天数、洞察数量
- 圆环进度条组件 (ProgressRing)
- 搜索筛选组件：实时搜索 + 状态筛选（全部/进行中/已完成）
- 分页组件：每页 20 个 + 省略号 + 上下页
- 动画系统：fadeInUp、stagger、checkBounce、progressFill
- 卡片 hover 悬浮效果
- 渐变背景 + 渐变分隔线
- AES-256-GCM 密码加密

### Changed
- Dashboard 限制展示 Top 5 目标/习惯，超出显示 "+N 个更多"
- 目标按进度百分比降序排序
- 习惯按打卡率降序排序
- 管理页面集成搜索/筛选/分页
- 移除 Dashboard 顶部标题和 logo

### Fixed
- E2E 测试选择器适配 Bold Modern 设计
- E2E 测试移除标题检查
