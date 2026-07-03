import { test, expect } from '@playwright/test'

/** 登录辅助函数 */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="password"]', process.env.APP_PASSWORD || 'GiX8HXfLe4WyM2oG')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

test.describe('目标 CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('目标列表页应显示页面标题', async ({ page }) => {
    await page.goto('/goals')
    await expect(page.locator('h1')).toContainText('目标')
  })

  test('目标列表页应显示新建目标按钮', async ({ page }) => {
    await page.goto('/goals')
    await expect(page.getByRole('link', { name: '新建目标' })).toBeVisible()
  })

  test('点击新建目标应进入创建页面', async ({ page }) => {
    await page.goto('/goals')
    await page.getByRole('link', { name: '新建目标' }).click()
    await expect(page).toHaveURL(/.*goals\/new/)
    await expect(page.locator('h1')).toContainText('新建目标')
  })

  test('应能创建新目标', async ({ page }) => {
    await page.goto('/goals/new')
    await page.fill('input#title', 'E2E 测试目标')
    await page.fill('input#targetValue', '100')
    await page.fill('input#unit', '元')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*goals/)
    await expect(page.locator('h4', { hasText: 'E2E 测试目标' }).first()).toBeVisible()
  })

  test('创建目标后应能在列表中看到编辑和删除按钮', async ({ page }) => {
    await page.goto('/goals')
    // 列表中至少有一个目标卡片（来自上一个测试）
    const firstGoalCard = page.locator('.rounded-xl.border').first()
    await expect(firstGoalCard.getByRole('link', { name: '编辑' })).toBeVisible()
    await expect(firstGoalCard.locator('button', { hasText: '删除' })).toBeVisible()
  })

  test('点击编辑应进入编辑页面', async ({ page }) => {
    await page.goto('/goals')
    const editLink = page.getByRole('link', { name: '编辑' }).first()
    await editLink.click()
    await expect(page).toHaveURL(/.*goals\/.*\/edit/)
  })

  test('应能编辑已有目标', async ({ page }) => {
    await page.goto('/goals')
    // 点击第一个编辑链接
    const editLink = page.getByRole('link', { name: '编辑' }).first()
    await editLink.click()
    await expect(page).toHaveURL(/.*goals\/.*\/edit/)

    // 修改标题
    await page.fill('input#title', '已更新的目标')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*goals/)
    await expect(page.locator('h4', { hasText: '已更新的目标' }).first()).toBeVisible()
  })

  test('新建目标页应有返回链接', async ({ page }) => {
    await page.goto('/goals/new')
    const backLink = page.getByRole('link', { name: '返回目标列表' })
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL(/.*goals$/)
  })
})
