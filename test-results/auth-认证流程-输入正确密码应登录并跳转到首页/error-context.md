# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> 认证流程 >> 输入正确密码应登录并跳转到首页
- Location: tests/e2e/auth.spec.ts:34:7

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
  3  | test.describe('认证流程', () => {
  4  |   test('未登录时访问首页应重定向到登录页', async ({ page }) => {
  5  |     await page.goto('/')
  6  |     await expect(page).toHaveURL(/.*login/)
  7  |   })
  8  | 
  9  |   test('未登录时访问目标页应重定向到登录页', async ({ page }) => {
  10 |     await page.goto('/goals')
  11 |     await expect(page).toHaveURL(/.*login/)
  12 |   })
  13 | 
  14 |   test('未登录时访问习惯页应重定向到登录页', async ({ page }) => {
  15 |     await page.goto('/habits')
  16 |     await expect(page).toHaveURL(/.*login/)
  17 |   })
  18 | 
  19 |   test('登录页应显示密码输入框和登录按钮', async ({ page }) => {
  20 |     await page.goto('/login')
  21 |     await expect(page.locator('input[type="password"]')).toBeVisible()
  22 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  23 |     await expect(page.locator('h1')).toContainText('Personal ERP')
  24 |   })
  25 | 
  26 |   test('输入错误密码应显示错误提示', async ({ page }) => {
  27 |     await page.goto('/login')
  28 |     await page.fill('input[type="password"]', 'wrong-password')
  29 |     await page.click('button[type="submit"]')
  30 |     await expect(page.locator('p.text-red-500')).toBeVisible()
  31 |     await expect(page.locator('p.text-red-500')).toContainText('密码错误')
  32 |   })
  33 | 
  34 |   test('输入正确密码应登录并跳转到首页', async ({ page }) => {
  35 |     await page.goto('/login')
  36 |     await page.fill('input[type="password"]', process.env.APP_PASSWORD || 'GiX8HXfLe4WyM2oG')
  37 |     await page.click('button[type="submit"]')
  38 |     await expect(page).toHaveURL('/')
> 39 |     await expect(page.locator('h1')).toContainText('Personal ERP')
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  40 |   })
  41 | })
  42 | 
```