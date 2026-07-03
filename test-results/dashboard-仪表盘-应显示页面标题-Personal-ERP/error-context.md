# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> 仪表盘 >> 应显示页面标题 Personal ERP
- Location: tests/e2e/dashboard.spec.ts:16:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Personal ERP"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')

```

```yaml
- main:
  - paragraph: 目标进度
  - paragraph: 8%
  - text: +12%
  - paragraph: 打卡率
  - paragraph: 44%
  - text: +5%
  - paragraph: 连续天数
  - paragraph: "6"
  - text: 最佳记录
  - paragraph: 洞察
  - paragraph: "0"
  - text: 1 条新
  - separator
  - heading "洞察" [level=2]
  - heading "暂无洞察" [level=3]
  - paragraph: 先添加目标和习惯，系统会为你生成跨模块的洞察分析
  - separator
  - heading "目标" [level=2]
  - button "查看全部"
  - heading "已更新的目标" [level=4]
  - text: 1 天后
  - img
  - text: 35%
  - paragraph: 3500 元 / 10000 元
  - link "编辑":
    - /url: /goals/45y5vWo49zJ_Vi4UvseGi/edit
  - button "删除"
  - heading "学习目标" [level=4]
  - text: 今天截止
  - img
  - text: 25%
  - paragraph: 3 本 / 12 本
  - link "编辑":
    - /url: /goals/MITSNU0BTPKXFW-bvzKz4/edit
  - button "删除"
  - heading "健康目标" [level=4]
  - img
  - text: 17%
  - paragraph: 5 kg / 30 kg
  - link "编辑":
    - /url: /goals/Wa6XpsZIJkLhth5kszz3g/edit
  - button "删除"
  - heading "旅行基金" [level=4]
  - img
  - text: 0%
  - paragraph: 0 元 / 20000 元
  - link "编辑":
    - /url: /goals/NrwTBRRWhY4LI_HdGLAv-/edit
  - button "删除"
  - heading "E2E 测试目标" [level=4]
  - img
  - text: 0%
  - paragraph: 0 元 / 100 元
  - link "编辑":
    - /url: /goals/9hnzgROy64TXfPdO16Q5d/edit
  - button "删除"
  - link "+5 个更多":
    - /url: /goals
  - heading "习惯" [level=2]
  - button "查看全部"
  - heading "运动" [level=4]
  - text: 连续 6 天 ↑ 86% 每天
  - link "编辑习惯":
    - /url: /habits/MfIC8b0eYTFkqPV-YPRz9/edit
    - text: 编辑
  - button "打卡":
    - img
  - img
  - text: 近 7 天
  - heading "阅读" [level=4]
  - text: 连续 1 天 ↑ 57% 每天
  - link "编辑习惯":
    - /url: /habits/gADGSWke_UDRDX3W8vY_B/edit
    - text: 编辑
  - button "取消打卡":
    - img
  - img
  - text: 近 7 天
  - heading "冥想" [level=4]
  - text: 连续 3 天 ↑ 43% 每天
  - link "编辑习惯":
    - /url: /habits/410u3KnXuCPVsNgEsi6hp/edit
    - text: 编辑
  - button "取消打卡":
    - img
  - img
  - text: 近 7 天
  - heading "喝水" [level=4]
  - text: 连续 1 天 ↑ 14% 每天
  - link "编辑习惯":
    - /url: /habits/eCQK7fJDR0Ux_hNCc3iK5/edit
    - text: 编辑
  - button "取消打卡":
    - img
  - img
  - text: 近 7 天
  - heading "E2E 测试习惯" [level=4]
  - text: 连续 1 天 ↑ 14% 每天
  - link "编辑习惯":
    - /url: /habits/QgAbMEP4yNvL65Tq864j2/edit
    - text: 编辑
  - button "取消打卡":
    - img
  - img
  - text: 近 7 天
  - link "+4 个更多":
    - /url: /habits
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | /** 登录辅助函数 */
  4  | async function login(page: import('@playwright/test').Page) {
  5  |   await page.goto('/login')
  6  |   await page.fill('input[type="password"]', process.env.APP_PASSWORD || 'GiX8HXfLe4WyM2oG')
  7  |   await page.click('button[type="submit"]')
  8  |   await page.waitForURL('/')
  9  | }
  10 | 
  11 | test.describe('仪表盘', () => {
  12 |   test.beforeEach(async ({ page }) => {
  13 |     await login(page)
  14 |   })
  15 | 
  16 |   test('应显示页面标题 Personal ERP', async ({ page }) => {
> 17 |     await expect(page.locator('h1')).toContainText('Personal ERP')
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  18 |   })
  19 | 
  20 |   test('应显示副标题', async ({ page }) => {
  21 |     await expect(page.locator('text=你的个人生活管理系统')).toBeVisible()
  22 |   })
  23 | 
  24 |   test('应显示洞察区块', async ({ page }) => {
  25 |     await expect(page.locator('h2', { hasText: '洞察' })).toBeVisible()
  26 |   })
  27 | 
  28 |   test('应显示目标区块', async ({ page }) => {
  29 |     await expect(page.locator('h2', { hasText: '目标' })).toBeVisible()
  30 |   })
  31 | 
  32 |   test('应显示习惯区块', async ({ page }) => {
  33 |     await expect(page.locator('h2', { hasText: '习惯' })).toBeVisible()
  34 |   })
  35 | 
  36 |   test('目标区块应有查看全部链接', async ({ page }) => {
  37 |     const goalsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '目标' }) })
  38 |     await expect(goalsSection.getByRole('button', { name: '查看全部' })).toBeVisible()
  39 |   })
  40 | 
  41 |   test('习惯区块应有查看全部链接', async ({ page }) => {
  42 |     const habitsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '习惯' }) })
  43 |     await expect(habitsSection.getByRole('button', { name: '查看全部' })).toBeVisible()
  44 |   })
  45 | 
  46 |   test('点击目标查看全部应跳转到目标页', async ({ page }) => {
  47 |     const goalsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '目标' }) })
  48 |     await goalsSection.getByRole('button', { name: '查看全部' }).click()
  49 |     await expect(page).toHaveURL(/.*goals/)
  50 |   })
  51 | 
  52 |   test('点击习惯查看全部应跳转到习惯页', async ({ page }) => {
  53 |     const habitsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '习惯' }) })
  54 |     await habitsSection.getByRole('button', { name: '查看全部' }).click()
  55 |     await expect(page).toHaveURL(/.*habits/)
  56 |   })
  57 | 
  58 |   test('目标区块无数据时应显示空状态', async ({ page }) => {
  59 |     // 如果没有目标数据，应显示空状态
  60 |     const goalsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '目标' }) })
  61 |     const hasGoals = await goalsSection.locator('h4').first().isVisible().catch(() => false)
  62 |     if (!hasGoals) {
  63 |       await expect(goalsSection.locator('text=开始追踪你的第一个目标')).toBeVisible()
  64 |     }
  65 |   })
  66 | 
  67 |   test('习惯区块无数据时应显示空状态', async ({ page }) => {
  68 |     const habitsSection = page.locator('section').filter({ has: page.locator('h2', { hasText: '习惯' }) })
  69 |     const hasHabits = await habitsSection.locator('h4').first().isVisible().catch(() => false)
  70 |     if (!hasHabits) {
  71 |       await expect(habitsSection.locator('text=开始养成你的第一个习惯')).toBeVisible()
  72 |     }
  73 |   })
  74 | })
  75 | 
```