import { test, expect } from '@playwright/test'

/** 登录辅助函数 */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="password"]', process.env.APP_PASSWORD || 'GiX8HXfLe4WyM2oG')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

test.describe('仪表盘', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('应显示洞察区块', async ({ page }) => {
    await expect(page.locator('h2', { hasText: '洞察' })).toBeVisible()
  })

  test('应显示目标区块', async ({ page }) => {
    await expect(page.locator('h2', { hasText: '目标' })).toBeVisible()
  })

  test('应显示习惯区块', async ({ page }) => {
    await expect(page.locator('h2', { hasText: '习惯' })).toBeVisible()
  })

  test('目标区块应有查看全部链接', async ({ page }) => {
    const goalsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '目标' }) })
    await expect(goalsSection.getByRole('button', { name: '查看全部' })).toBeVisible()
  })

  test('习惯区块应有查看全部链接', async ({ page }) => {
    const habitsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '习惯' }) })
    await expect(habitsSection.getByRole('button', { name: '查看全部' })).toBeVisible()
  })

  test('点击目标查看全部应跳转到目标页', async ({ page }) => {
    const goalsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '目标' }) })
    await goalsSection.getByRole('button', { name: '查看全部' }).click()
    await expect(page).toHaveURL(/.*goals/)
  })

  test('点击习惯查看全部应跳转到习惯页', async ({ page }) => {
    const habitsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '习惯' }) })
    await habitsSection.getByRole('button', { name: '查看全部' }).click()
    await expect(page).toHaveURL(/.*habits/)
  })

  test('目标区块无数据时应显示空状态', async ({ page }) => {
    // 如果没有目标数据，应显示空状态
    const goalsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '目标' }) })
    const hasGoals = await goalsSection.locator('h4').first().isVisible().catch(() => false)
    if (!hasGoals) {
      await expect(goalsSection.locator('text=开始追踪你的第一个目标')).toBeVisible()
    }
  })

  test('习惯区块无数据时应显示空状态', async ({ page }) => {
    const habitsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '习惯' }) })
    const hasHabits = await habitsSection.locator('h4').first().isVisible().catch(() => false)
    if (!hasHabits) {
      await expect(habitsSection.locator('text=开始养成你的第一个习惯')).toBeVisible()
    }
  })
})
