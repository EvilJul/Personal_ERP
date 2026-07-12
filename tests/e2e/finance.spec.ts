import { test, expect } from '@playwright/test'

/** 登录辅助函数 */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="password"]', process.env.APP_PASSWORD || 'GiX8HXfLe4WyM2oG')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

test.describe('财务页面', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应能访问财务页面', async ({ page }) => {
    await page.goto('/finance')
    await expect(page.locator('h1', { hasText: '财务' })).toBeVisible()
  })

  test('应显示财务概览卡片', async ({ page }) => {
    await page.goto('/finance')
    await expect(page.locator('text=总余额')).toBeVisible()
    await expect(page.locator('text=账户数')).toBeVisible()
    await expect(page.locator('text=本月交易')).toBeVisible()
  })

  test('应显示同步按钮', async ({ page }) => {
    await page.goto('/finance')
    await expect(page.getByRole('button', { name: '同步数据' })).toBeVisible()
  })

  test('应显示筛选控件', async ({ page }) => {
    await page.goto('/finance')
    // 两个日期输入框（开始和结束）
    const dateInputs = page.locator('input[type="date"]')
    await expect(dateInputs.first()).toBeVisible()
    await expect(dateInputs.nth(1)).toBeVisible()
    // 类别下拉选择
    await expect(page.locator('select')).toBeVisible()
  })

  test('应显示账户列表区块', async ({ page }) => {
    await page.goto('/finance')
    await expect(page.locator('h2', { hasText: '账户列表' })).toBeVisible()
  })

  test('应显示交易记录区块', async ({ page }) => {
    await page.goto('/finance')
    await expect(page.locator('h2', { hasText: '交易记录' })).toBeVisible()
  })

  test('应显示返回首页链接', async ({ page }) => {
    await page.goto('/finance')
    const backLink = page.getByRole('link', { name: '返回首页' })
    await expect(backLink).toBeVisible()
  })

  test('点击返回首页应跳转到首页', async ({ page }) => {
    await page.goto('/finance')
    await page.getByRole('link', { name: '返回首页' }).click()
    await expect(page).toHaveURL('/')
  })

  test('类别筛选应有默认选项"全部类别"', async ({ page }) => {
    await page.goto('/finance')
    const select = page.locator('select')
    await expect(select.locator('option', { hasText: '全部类别' })).toBeVisible()
  })
})
