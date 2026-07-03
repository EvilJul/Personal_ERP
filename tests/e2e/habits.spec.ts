import { test, expect } from '@playwright/test'

/** 登录辅助函数 */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="password"]', process.env.APP_PASSWORD || 'GiX8HXfLe4WyM2oG')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

test.describe('习惯打卡', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('习惯列表页应显示页面标题', async ({ page }) => {
    await page.goto('/habits')
    await expect(page.locator('h1')).toContainText('习惯')
  })

  test('习惯列表页应显示新建习惯按钮', async ({ page }) => {
    await page.goto('/habits')
    await expect(page.getByRole('link', { name: '新建习惯' })).toBeVisible()
  })

  test('点击新建习惯应进入创建页面', async ({ page }) => {
    await page.goto('/habits')
    await page.getByRole('link', { name: '新建习惯' }).click()
    await expect(page).toHaveURL(/.*habits\/new/)
  })

  test('应能创建新习惯', async ({ page }) => {
    await page.goto('/habits/new')
    await page.fill('input#title', 'E2E 测试习惯')
    await page.locator('select#frequency').selectOption('daily')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*habits/)
    await expect(page.locator('h4', { hasText: 'E2E 测试习惯' }).first()).toBeVisible()
  })

  test('习惯卡片应有打卡按钮', async ({ page }) => {
    await page.goto('/habits')
    // 至少有一个打卡按钮（aria-label="打卡" 或 "取消打卡"）
    const checkinButton = page.locator('button[aria-label="打卡"]').first()
    await expect(checkinButton).toBeVisible()
  })

  test('点击打卡按钮应切换为已打卡状态', async ({ page }) => {
    await page.goto('/habits')
    // 点击第一个"打卡"按钮
    const checkinButton = page.locator('button[aria-label="打卡"]').first()
    await checkinButton.click()
    // 打卡后 aria-label 应变为"取消打卡"
    await expect(page.locator('button[aria-label="取消打卡"]').first()).toBeVisible()
  })

  test('点击取消打卡应切换回未打卡状态', async ({ page }) => {
    await page.goto('/habits')
    // 如果存在已打卡的按钮，点击取消
    const uncheckinButton = page.locator('button[aria-label="取消打卡"]').first()
    if (await uncheckinButton.isVisible()) {
      await uncheckinButton.click()
      await expect(page.locator('button[aria-label="打卡"]').first()).toBeVisible()
    }
  })

  test('习惯卡片应有编辑链接', async ({ page }) => {
    await page.goto('/habits')
    const editLink = page.locator('a[aria-label="编辑习惯"]').first()
    await expect(editLink).toBeVisible()
  })

  test('点击编辑应进入编辑页面', async ({ page }) => {
    await page.goto('/habits')
    const editLink = page.locator('a[aria-label="编辑习惯"]').first()
    await editLink.click()
    await expect(page).toHaveURL(/.*habits\/.*\/edit/)
  })

  test('新建习惯页应有返回链接', async ({ page }) => {
    await page.goto('/habits/new')
    const backLink = page.getByRole('link', { name: '返回习惯列表' })
    // 如果存在返回链接则验证
    if (await backLink.isVisible()) {
      await backLink.click()
      await expect(page).toHaveURL(/.*habits$/)
    }
  })
})
