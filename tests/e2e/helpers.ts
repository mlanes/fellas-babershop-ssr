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

/**
 * Waits for the page to come to rest with a section at the top of the window,
 * and says where its top edge is.
 *
 * @param page - a page that is scrolling, or about to scroll, to the section
 * @param section - the id of the section
 * @returns the section's top edge, in pixels from the top of the window
 * @throws after 15 seconds if the section never comes to rest near the top
 */
export async function landingOf(page: Page, section: string): Promise<number> {
  let previous = Number.NaN
  let top = Number.NaN
  await expect(async () => {
    // "|| 0" because rounding a hair above the window gives -0, which is not 0
    // to an exact comparison.
    top = await page
      .locator(`#${section}`)
      .evaluate((element) => Math.round(element.getBoundingClientRect().top) || 0)
    const atRest = top === previous
    previous = top
    expect(atRest, `#${section} is still moving, at ${top}px`).toBe(true)
    expect(top, `#${section} came to rest away from the top`).toBeGreaterThanOrEqual(0)
    expect(top, `#${section} came to rest away from the top`).toBeLessThan(250)
  }).toPass({ intervals: [200], timeout: 15_000 })
  return top
}

/**
 * Jumps to the foot of the page and waits there until the page has stopped
 * changing height.
 *
 * WebKit abandons a glide that begins in the first moments after such a jump
 * on a page just loaded: it moves 3px and stops. With the page left to settle
 * it goes the whole way, and a visitor who has scrolled to the footer is
 * always past that moment.
 */
export async function goToFoot(page: Page): Promise<void> {
  await page.evaluate(async () => {
    let height = 0
    for (let reading = 0; reading < 40; reading++) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (document.documentElement.scrollHeight === height) return
      height = document.documentElement.scrollHeight
    }
  })
}

/**
 * Fails unless two landings are the same place. A pixel apart counts as the
 * same: a section's edge can fall on a fraction of a pixel, and two readings
 * of it then round to neighbours.
 */
export function expectSamePlace(landing: number, other: number): void {
  expect(Math.abs(landing - other), `${landing}px against ${other}px`).toBeLessThanOrEqual(1)
}
