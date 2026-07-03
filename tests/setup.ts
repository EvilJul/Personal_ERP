/**
 * 测试全局 setup
 * 在所有测试运行前设置必要的环境变量
 */
process.env.SESSION_SECRET = 'test-session-secret-for-unit-tests-only'
process.env.APP_PASSWORD = 'test-password-123'
process.env.NODE_ENV = 'test'
