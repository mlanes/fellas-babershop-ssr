import { expect, type Locator, type Page } from '@playwright/test'

/** The cookie the site stores the visitor's chosen language in. */
export const localeCookie = 'i18n_redirected'

export async function gotoAndReady(page: Page, path: string) {
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.textContent = '.app-loader { display: none !important; }'
    document.documentElement.appendChild(style)
  })
  await page.goto(path, { waitUntil: 'domcontentloaded' })
}

/**
 * Opens the language dropdown in whichever header bar is visible.
 * A click before the page has hydrated is ignored, so it clicks until the
 * dropdown is open.
 *
 * @param page - a page that has the site header on it
 * @returns the open dropdown, to look options up in
 * @throws after 20 seconds if the dropdown never opens
 */
export async function openLanguageMenu(page: Page): Promise<Locator> {
  const dropdown = page.locator('.language-selector__dropdown:visible')
  await expect(async () => {
    if ((await dropdown.count()) === 0) {
      await page.locator('.language-selector__button:visible').first().click({ timeout: 2000 })
    }
    await expect(dropdown).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 20_000 })
  return dropdown
}
