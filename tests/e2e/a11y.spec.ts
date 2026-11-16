import { expect, test, type Locator, type Page } from '@playwright/test'
import { blockingViolations, paintedTheme, textContrast, unfinishedFades } from '../accessibility'
import { gotoAndReady, openLanguageMenu, pageHydrated } from './helpers'

/**
 * Automated WCAG 2.1 A/AA accessibility scan of every page via axe-core.
 * What counts as a failure is decided once, in `blockingViolations`.
 */
const routes = ['/', '/services', '/gallery', '/contacts', '/score']
const themes = ['light', 'dark'] as const
const hoveredText = [
  { name: 'coming-soon back button', route: '/services', selector: '.coming-soon__back' },
  { name: 'footer nav link', route: '/', selector: '.footer__link' },
  { name: 'footer contact link', route: '/', selector: '.footer__contact' },
]

/**
 * Stops the page's slow repeating timers before it loads. The home page swaps
 * testimonials and barbershop photos every five seconds, and a scan that
 * catches a swap reads half-faded text as a contrast violation. The clock is
 * the one thing here that is not the site's own, so it is the thing to control.
 * Quick timers, such as the loader's progress bar, keep running.
 *
 * Call it before the page is opened.
 */
async function stopSlowTimers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const startInterval = window.setInterval.bind(window)
    Object.defineProperty(window, 'setInterval', {
      value: (handler: TimerHandler, timeout?: number, ...rest: unknown[]) =>
        timeout !== undefined && timeout >= 1000 ? 0 : startInterval(handler, timeout, ...rest),
    })
  })
}

test.describe('Accessibility (axe-core)', () => {
  for (const theme of themes) {
    for (const route of routes) {
      test(`${route} has no critical or serious axe violations in ${theme} theme`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: theme })
        await stopSlowTimers(page)
        await gotoAndReady(page, route)
        expect(await paintedTheme(page)).toBe(theme)
        await pageSettled(page)
        expect(await blockingViolations(page)).toEqual([])
      })
    }

    test(`home with mobile menu open has no critical or serious axe violations in ${theme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: theme })
      await page.setViewportSize({ width: 390, height: 844 })
      await stopSlowTimers(page)
      await gotoAndReady(page, '/')
      expect(await paintedTheme(page)).toBe(theme)
      await pageHydrated(page)
      await page.locator('button.header__mobile-toggle').click()
      await page.locator('.header__mobile-menu').waitFor()
      await pageSettled(page)
      expect(await blockingViolations(page)).toEqual([])
    })
  }

  // The scans above stop these timers, so nothing fades in the middle of one.
  test('the page stays still once its slow timers are stopped', async ({ page }) => {
    await stopSlowTimers(page)
    await gotoAndReady(page, '/')
    await pageSettled(page)
    const testimonial = page.locator('.testimonials__comment')
    const shown = await testimonial.textContent()

    // The testimonials change every five seconds.
    await page.waitForTimeout(6000)

    expect(await testimonial.textContent()).toBe(shown)
  })

  // axe reports these as "incomplete", so the contrast is measured here instead:
  // the nav links and the card button have a pseudo-element, and the page
  // number is too short for it to judge.
  const brandRedText = [
    { name: 'active desktop nav link', selector: '.header__nav-link--active' },
    {
      name: 'services pagination current page',
      selector: '.expanded-services__pagination--desktop .expanded-services__pagination-current',
    },
    { name: 'barbershop card map link', selector: '.barbershop-card__button--secondary' },
  ]

  for (const theme of themes) {
    for (const { name, selector } of brandRedText) {
      test(`${name} meets 4.5:1 contrast in ${theme} theme`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme })
        await page.setViewportSize({ width: 1440, height: 900 })
        await gotoAndReady(page, '/')
        expect(await paintedTheme(page)).toBe(theme)

        await expect.poll(() => textContrast(page, selector)).toBeGreaterThanOrEqual(4.5)
      })
    }

    // axe never scans hover states.
    for (const { name, route, selector } of hoveredText) {
      test(`${name} keeps 4.5:1 contrast while hovered in ${theme} theme`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme })
        await gotoAndReady(page, route)
        expect(await paintedTheme(page)).toBe(theme)
        await hoverUntilSettled(page, page.locator(selector).first())

        expect(await textContrast(page, selector)).toBeGreaterThanOrEqual(4.5)
      })
    }

    // axe scans pages with the dropdown closed.
    test(`selected language option meets 4.5:1 contrast in ${theme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme })
      await gotoAndReady(page, '/')
      expect(await paintedTheme(page)).toBe(theme)
      await openLanguageMenu(page)

      await expect
        .poll(() => textContrast(page, '.language-selector__option--active'))
        .toBeGreaterThanOrEqual(4.5)
    })
  }
})

/**
 * Hovers an element and waits until the hover holds and nothing on the page
 * is still fading. Hydration can drop the hover state, so it hovers again
 * until the state holds.
 *
 * @throws after 20 seconds if the element never stays hovered and settled
 */
async function hoverUntilSettled(page: Page, target: Locator): Promise<void> {
  await expect(async () => {
    await page.mouse.move(0, 0)
    // At a viewport edge the fixed header or the dev server's DevTools badge
    // covers the element and takes the pointer.
    await target.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' })
    )
    await target.hover()
    await expect
      .poll(
        async () =>
          (await target.evaluate((element) => element.matches(':hover'))) &&
          (await unfinishedFades(page)) === 0,
        { timeout: 3000 }
      )
      .toBe(true)
  }).toPass({ timeout: 20000 })
}

/**
 * Waits until Vue has mounted and every entrance animation has ended. The
 * sections fade in on timers from page load; axe skips text that is still
 * invisible and reads half-faded text as a contrast violation.
 */
async function pageSettled(page: Page): Promise<void> {
  await pageHydrated(page)
  await expect.poll(() => unfinishedFades(page), { timeout: 15000 }).toBe(0)
}
