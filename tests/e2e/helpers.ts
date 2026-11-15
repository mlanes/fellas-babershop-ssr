import { expect, type Locator, type Page } from '@playwright/test'

export { localeCookie } from '../../data/locales'

export async function gotoAndReady(page: Page, path: string) {
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.textContent = '.app-loader { display: none !important; }'
    document.documentElement.appendChild(style)
  })
  // The home address may hand over to another language's page before it has
  // loaded, and Firefox then reports the first load as aborted. Whichever page
  // ends up on screen is the one to wait for.
  await page.goto(path, { waitUntil: 'commit' }).catch((error: unknown) => {
    const handedOver = error instanceof Error && error.message.includes('NS_BINDING_ABORTED')
    if (!handedOver) throw error
  })
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Waits until the page has hydrated. AppLoader takes its overlay out of the DOM
 * once the app has mounted and the page has loaded; a click before then does
 * nothing, because the handlers are not attached yet.
 *
 * @throws after 15 seconds if the overlay is still there
 */
export async function pageHydrated(page: Page): Promise<void> {
  await expect(page.locator('.app-loader')).toHaveCount(0, { timeout: 15_000 })
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
      await page.locator('.language-selector__button:visible').click({ timeout: 2000 })
    }
    await expect(dropdown).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 20_000 })
  return dropdown
}
