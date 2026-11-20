import { expect, test, type Locator, type Page } from '@playwright/test'
import { gotoAndReady, pageHydrated } from './helpers'

// The sections of the home page the main menu leads to, by the id each has.
const sections = ['about', 'services', 'gallery', 'barbershops']

/**
 * Finds a section's link in whichever menu the screen shows, opening the
 * phone menu first when that is the one.
 *
 * @param page - a hydrated page with the site header on it
 * @param section - the id of a home-page section, e.g. `about`
 */
async function menuLink(page: Page, section: string): Promise<Locator> {
  const phoneMenuButton = page.locator('button.header__mobile-toggle')
  if (await phoneMenuButton.isVisible()) await phoneMenuButton.click()
  return page.locator(`header a[href$="#${section}"]:visible`).first()
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
async function landingOf(page: Page, section: string): Promise<number> {
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
 * Scrolls up a little, which is what a visitor does to bring back the header
 * after it slid away on the way down.
 *
 * @throws after 5 seconds if the header does not come back
 */
async function bringHeaderBack(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // A frame either side, so the header sees this as a move of its own and
    // not as the tail of whatever scrolling came before.
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))
    await nextFrame()
    window.scrollBy({ top: -120, behavior: 'instant' })
    await nextFrame()
  })
  await expect(page.locator('header.header')).toBeInViewport()
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
async function goToFoot(page: Page): Promise<void> {
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
function expectSamePlace(landing: number, other: number): void {
  expect(Math.abs(landing - other), `${landing}px against ${other}px`).toBeLessThanOrEqual(1)
}

test.describe('The main menu takes a visitor to a section of the home page', () => {
  for (const section of sections) {
    test(`#${section}: a click lands where the section's own address lands`, async ({ page }) => {
      await gotoAndReady(page, `/#${section}`)
      await pageHydrated(page)
      const byAddress = await landingOf(page, section)

      await gotoAndReady(page, '/')
      await pageHydrated(page)
      await (await menuLink(page, section)).click()
      const byClick = await landingOf(page, section)

      expectSamePlace(byClick, byAddress)
    })

    test(`#${section}: its heading comes to rest below the header`, async ({ page }) => {
      await gotoAndReady(page, '/')
      await pageHydrated(page)
      await (await menuLink(page, section)).click()
      await landingOf(page, section)

      // The header slides away on the way down and back on the way up, so the
      // heading has to clear it whether or not it is showing at this moment.
      const headerHeight = await page
        .locator('header.header')
        .evaluate((element) => element.getBoundingClientRect().height)
      const headingTop = await page
        .locator(`#${section}`)
        .locator('h1, h2')
        .first()
        .evaluate((element) => element.getBoundingClientRect().top)
      expect(headingTop).toBeGreaterThanOrEqual(headerHeight)
    })
  }

  test('a click puts the section in the address, and Back returns to the one before', async ({
    page,
  }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)

    await (await menuLink(page, 'services')).click()
    await expect(page).toHaveURL(/#services$/)
    await landingOf(page, 'services')

    await bringHeaderBack(page)
    await (await menuLink(page, 'barbershops')).click()
    await expect(page).toHaveURL(/#barbershops$/)
    await landingOf(page, 'barbershops')

    // Back is the browser's: it returns to where the visitor was when they
    // left, which is the services section with the header brought back.
    await page.goBack()
    await expect(page).toHaveURL(/#services$/)
    await landingOf(page, 'services')
  })

  test('a second click on the same item brings back a visitor who scrolled away', async ({
    page,
  }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    await (await menuLink(page, 'services')).click()
    const firstTime = await landingOf(page, 'services')

    await page.evaluate(() => window.scrollBy({ top: 900, behavior: 'instant' }))
    await bringHeaderBack(page)

    await (await menuLink(page, 'services')).click()
    expectSamePlace(await landingOf(page, 'services'), firstTime)
  })

  test("the footer's links land where the header's do", async ({ page }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    await (await menuLink(page, 'services')).click()
    const fromHeader = await landingOf(page, 'services')

    await goToFoot(page)
    await page.locator('footer a[href$="#services"]').click()
    await expect(page).toHaveURL(/#services$/)
    expectSamePlace(await landingOf(page, 'services'), fromHeader)
  })

  test('from another page, a click arrives where a click on the home page does', async ({
    page,
  }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    await (await menuLink(page, 'about')).click()
    const fromHome = await landingOf(page, 'about')

    await gotoAndReady(page, '/services')
    await pageHydrated(page)
    await (await menuLink(page, 'about')).click()
    await expect(page).toHaveURL(/\/#about$/)
    expectSamePlace(await landingOf(page, 'about'), fromHome)
  })

  for (const { page: from, language, home } of [
    { page: '/', language: 'Portuguese', home: '/' },
    { page: '/services', language: 'Portuguese', home: '/' },
    { page: '/en/', language: 'English', home: '/en/' },
    { page: '/en/services/', language: 'English', home: '/en/' },
  ]) {
    test(`on ${from} each link is the full address of its section on the ${language} home page`, async ({
      page,
    }) => {
      // What a new tab, a copied link and a browser without scripts all use.
      await gotoAndReady(page, from)
      for (const section of sections) {
        await expect(page.locator(`a.header__nav-link[href$="#${section}"]`)).toHaveAttribute(
          'href',
          `${home}#${section}`
        )
      }
    })
  }

  test('a visitor who asked for less motion is taken there without the glide', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoAndReady(page, '/')
    await pageHydrated(page)

    // Every place the page passes through from the click until it has rested.
    await page.evaluate(() => {
      const positions = new Set<number>()
      const started = performance.now()
      const note = () => {
        positions.add(Math.round(window.scrollY))
        if (performance.now() - started < 3000) requestAnimationFrame(note)
        else document.documentElement.dataset.placesPassed = String(positions.size)
      }
      requestAnimationFrame(note)
    })
    await (await menuLink(page, 'gallery')).click()
    await landingOf(page, 'gallery')

    // Where it started and where it stopped, and nowhere between.
    await expect(page.locator('html')).toHaveAttribute('data-places-passed', /^[12]$/, {
      timeout: 10_000,
    })
  })
})
