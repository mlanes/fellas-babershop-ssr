import { expect, test } from '@playwright/test'
import { gotoAndReady } from './helpers'

test.describe('Theme toggle', () => {
  test.use({ colorScheme: 'light' })

  test('sets an explicit data-theme on first click', async ({ page }) => {
    await gotoAndReady(page, '/')

    const themeButton = page.locator('button.header__theme-toggle:visible')
    await themeButton.click()

    await expect(page.locator('html')).toHaveAttribute('data-theme', /^(light|dark)$/)
  })

  test('toggling twice yields opposite themes', async ({ page }) => {
    await gotoAndReady(page, '/')
    const themeButton = page.locator('button.header__theme-toggle:visible')

    await themeButton.click()
    const first = await page.locator('html').getAttribute('data-theme')
    expect(first === 'light' || first === 'dark').toBe(true)

    await themeButton.click()
    const second = first === 'light' ? 'dark' : 'light'
    await expect(page.locator('html')).toHaveAttribute('data-theme', second)
  })

  test('theme choice persists across reload', async ({ page }) => {
    await gotoAndReady(page, '/')
    const themeButton = page.locator('button.header__theme-toggle:visible')
    await themeButton.click()
    const chosen = await page.locator('html').getAttribute('data-theme')
    expect(chosen).not.toBeNull()

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', chosen!)
  })
})

test.describe('Mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens and closes', async ({ page }) => {
    await gotoAndReady(page, '/')
    const toggle = page.locator('button.header__mobile-toggle')
    await expect(toggle).toBeVisible()
    await expect(page.locator('.header__mobile-menu')).toHaveCount(0)

    await toggle.click()
    const menu = page.locator('.header__mobile-menu')
    await expect(menu).toBeVisible()
    expect(await page.locator('.header__mobile-nav-link').count()).toBeGreaterThan(0)

    await toggle.click()
    await expect(menu).toHaveCount(0)
  })
})

test.describe('Language selector', () => {
  test('dropdown lists all 4 locales', async ({ page }) => {
    await gotoAndReady(page, '/')
    await page.locator('.language-selector__button:visible').click()

    const dropdown = page.locator('.language-selector__dropdown:visible')
    await expect(dropdown).toBeVisible()
    await expect(dropdown.locator('.language-selector__option')).toHaveCount(4)

    for (const label of ['Português', 'English', 'Español', 'Français']) {
      await expect(dropdown.locator('.language-selector__option', { hasText: label })).toHaveCount(
        1
      )
    }
  })

  test('selecting English updates cookie and html lang', async ({ page, context }) => {
    await context.addCookies([
      { name: 'i18n_redirected', value: 'pt', url: 'http://localhost:3000' },
    ])
    await gotoAndReady(page, '/')
    await expect(page.locator('html')).toHaveAttribute('lang', /^pt/)

    await page.locator('.language-selector__button:visible').click()
    const dropdown = page.locator('.language-selector__dropdown:visible')
    await expect(dropdown).toBeVisible()
    await dropdown.locator('.language-selector__option', { hasText: 'English' }).click()

    await expect(page.locator('html')).toHaveAttribute('lang', /^en/, { timeout: 10_000 })

    await expect
      .poll(
        async () => {
          const cookies = await context.cookies()
          return cookies.find((c) => c.name === 'i18n_redirected')?.value
        },
        { timeout: 10_000 }
      )
      .toBe('en')
  })
})
