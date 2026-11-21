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
 * Waits until a section is in its landing place and staying there: its top
 * edge at its scroll margin, which the stylesheet sets and menu.spec.ts holds
 * to 40px.
 *
 * It waits for that place, and not for the page to stop moving. The last
 * stretch of a long glide is slow, and on a slow machine two looks 200ms apart
 * agreed while the section was still 50px short. A helper that took that for
 * rest reported 88, 93 and 111px on CI for sections that went on to arrive.
 *
 * @param page - a page that is on its way, or about to be, to the section
 * @param section - the id of the section
 * @throws after 20 seconds if the section is not there, saying where it is
 */
export async function arrivesAt(page: Page, section: string): Promise<void> {
  let wasThere = false
  await expect(async () => {
    // "|| 0" because rounding a hair above the window gives -0, and the
    // message below would print it.
    const { top, landing } = await page.locator(`#${section}`).evaluate((element) => ({
      top: Math.round(element.getBoundingClientRect().top) || 0,
      landing: Math.round(Number.parseFloat(getComputedStyle(element).scrollMarginTop)),
    }))
    // A pixel either way: a section's edge can fall on a fraction of one.
    const there = Math.abs(top - landing) <= 1
    const stayed = there && wasThere
    wasThere = there
    expect(stayed, `#${section} is at ${top}px and lands at ${landing}px`).toBe(true)
  }).toPass({ intervals: [250], timeout: 20_000 })
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
 * Opens the phone menu and waits until it has finished sliding open.
 *
 * A link tapped while the menu was still on its way in sometimes did nothing
 * in WebKit: 2 times in 24 for a second tap on the same item. Waited for, it
 * went 60 times in 60.
 *
 * @param page - a hydrated page at a width that shows the phone menu's button
 */
export async function openPhoneMenu(page: Page): Promise<void> {
  await page.locator('button.header__mobile-toggle').click()
  await expect(page.locator('.header__mobile-menu')).toBeVisible()
  await expect(page.locator('[class*="mobile-menu-enter"]')).toHaveCount(0)
}
