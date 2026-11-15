import { expect, test } from '@playwright/test'
import { gotoAndReady } from './helpers'

// Addresses that name no language are Portuguese.
const routes = [
  { path: '/', title: /Fellas Barbers/i },
  { path: '/services', title: /Serviços/i },
  { path: '/gallery', title: /Galeria/i },
  { path: '/contacts', title: /Contactos/i },
  { path: '/score', title: /Score/i },
]

test.describe('Navigation', () => {
  for (const { path, title } of routes) {
    test(`${path} responds 200, renders title, and shows header`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page).toHaveTitle(title)
      await expect(page.locator('header.header')).toBeVisible()
    })
  }

  test('html element has a lang attribute', async ({ page }) => {
    await gotoAndReady(page, '/')
    await expect(page.locator('html')).toHaveAttribute('lang', /^(pt|en|es|fr)/, {
      timeout: 20_000,
    })
  })
})
