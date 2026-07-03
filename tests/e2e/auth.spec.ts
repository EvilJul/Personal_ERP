import { test, expect } from '@playwright/test'

test.describe('认证流程', () => {
  test('未登录时访问首页应重定向到登录页', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*login/)
  })

  test('未登录时访问目标页应重定向到登录页', async ({ page }) => {
    await page.goto('/goals')
    await expect(page).toHaveURL(/.*login/)
  })

  test('未登录时访问习惯页应重定向到登录页', async ({ page }) => {
    await page.goto('/habits')
    await expect(page).toHaveURL(/.*login/)
  })

  test('登录页应显示密码输入框和登录按钮', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Personal ERP')
  })

  test('输入错误密码应显示错误提示', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="password"]', 'wrong-password')
    await page.click('button[type="submit"]')
    await expect(page.locator('p.text-red-500')).toBeVisible()
    await expect(page.locator('p.text-red-500')).toContainText('密码错误')
  })

  test('输入正确密码应登录并跳转到首页', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="password"]', process.env.APP_PASSWORD || 'GiX8HXfLe4WyM2oG')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Personal ERP')
  })
})
