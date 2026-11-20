import { expect, test, type Locator, type Page } from '@playwright/test'
import { expectSamePlace, goToFoot, gotoAndReady, landingOf, pageHydrated } from './helpers'

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

  // Then still, as a visitor's page is by the time they reach for the menu.
  // Asked to glide while it is settling from a jump like the one above,
  // WebKit gave up 2 times in 16.
  let previous = Number.NaN
  await expect(async () => {
    const now = await page.evaluate(() => Math.round(window.scrollY))
    const still = now === previous
    previous = now
    expect(still).toBe(true)
  }).toPass({ intervals: [200], timeout: 10_000 })
}

test.describe('The main menu takes a visitor to a section of the home page', () => {
  test('every section of the home page comes to rest 40px below the top', async ({ page }) => {
    // The one place the number is held. The other cases only ask that every
    // way in lands alike, which they would at any number, 0 included.
    await gotoAndReady(page, '/')
    const margins = await page
      .locator('section[id]')
      .evaluateAll((all) => all.map((one) => `${one.id}: ${getComputedStyle(one).scrollMarginTop}`))

    expect(margins.length).toBeGreaterThanOrEqual(8)
    for (const margin of margins) expect(margin).toMatch(/: 40px$/)
  })

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
