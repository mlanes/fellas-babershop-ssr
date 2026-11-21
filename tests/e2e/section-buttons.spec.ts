import { expect, test, type Locator, type Page } from '@playwright/test'
import { arrivesAt, goToFoot, gotoAndReady, openPhoneMenu, pageHydrated } from './helpers'

// Every button on the home page that leads to one of its sections.
const buttons = [
  {
    name: "the hero's booking button",
    button: '.hero__book-btn',
    section: 'barbershops',
    // It pulses for as long as it is on screen, so it never holds still for
    // the click to wait for.
    neverStill: true,
  },
  { name: 'the hero\'s "see more"', button: '.hero__scroll-indicator', section: 'about' },
  { name: "the about section's button", button: '#about button', section: 'barbershops' },
  {
    name: 'the services section\'s "view pricing"',
    button: '.services__button',
    section: 'expanded-services',
  },
]

/**
 * Puts a button in the middle of the window, at once, and waits there until
 * it has stopped moving.
 *
 * Left to scroll to the button by itself, the browser glides, and WebKit
 * abandons the next glide when it starts before the page has settled.
 */
async function bringIntoView(button: Locator): Promise<void> {
  let previous = Number.NaN
  await expect(async () => {
    const top = await button.evaluate((element) => {
      element.scrollIntoView({ behavior: 'instant', block: 'center' })
      return Math.round(element.getBoundingClientRect().top)
    })
    const still = top === previous
    previous = top
    expect(still).toBe(true)
  }).toPass({ intervals: [150], timeout: 10_000 })
}

/** The booking button of whichever header the screen shows, phone menu opened if need be. */
async function headerBookingButton(page: Page): Promise<Locator> {
  const phoneMenuButton = page.locator('button.header__mobile-toggle')
  if (await phoneMenuButton.isVisible()) await openPhoneMenu(page)
  return page.locator('header .f-button--primary:visible').first()
}

test.describe('A button that leads to a section lands where a link to it does', () => {
  for (const { name, button, section, neverStill } of buttons) {
    test(`${name} leads to #${section}`, async ({ page }) => {
      const control = page.locator(button).first()
      await gotoAndReady(page, '/')
      await pageHydrated(page)
      // The hero's booking button gives way to the header's on a wide screen.
      test.skip(!(await control.isVisible()), 'this button is not shown on a screen this size')

      if (!neverStill) await bringIntoView(control)
      await control.click({ force: neverStill })

      await expect(page).toHaveURL(new RegExp(`#${section}$`))
      await arrivesAt(page, section)
    })
  }

  test('Back, after a button, returns to the address before it', async ({ page }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    const control = page.locator('#about button').first()
    await bringIntoView(control)
    await control.click()
    await expect(page).toHaveURL(/#barbershops$/)
    await arrivesAt(page, 'barbershops')

    await page.goBack()
    await expect(page).toHaveURL((url) => url.pathname === '/' && url.hash === '')
  })

  for (const { from, home } of [
    { from: '/en/', home: '/en/' },
    { from: '/en/contacts/', home: '/en/' },
    { from: '/services', home: '/' },
    { from: '/es/', home: '/es/' },
  ]) {
    test(`the header's booking button, on ${from}, leads to ${home}#barbershops`, async ({
      page,
    }) => {
      await gotoAndReady(page, from)
      await pageHydrated(page)
      await (await headerBookingButton(page)).click()

      await expect(page).toHaveURL((url) => url.pathname === home && url.hash === '#barbershops', {
        timeout: 15_000,
      })
      await arrivesAt(page, 'barbershops')
    })
  }

  test('paging through the price list brings it back to the same place, once the new page is in', async ({
    page,
  }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    const priceList = page.locator('#expanded-services')
    // "Previous" comes first and "next" last, in whichever pager the screen shows.
    const next = page.locator('.expanded-services__pagination-btn:visible').last()
    await bringIntoView(next)
    // Well away from where it should land, so being there afterwards means it
    // was brought there. On a wide screen the pager stays in reach as the
    // list goes by; on a phone it is at the foot of the list, further still.
    await priceList.evaluate((section) => {
      const top = section.getBoundingClientRect().top
      if (top > -400) window.scrollBy({ top: top + 400, behavior: 'instant' })
    })
    const addressBefore = page.url()

    await next.click()
    await expect(page.locator('.expanded-services__pagination-current:visible')).toHaveText('2')
    await expect(page.locator('[class*="-enter-active"], [class*="-leave-active"]')).toHaveCount(0)

    await arrivesAt(page, 'expanded-services')
    expect(page.url()).toBe(addressBefore)
  })

  for (const path of ['/', '/services']) {
    test(`the footer's arrow, on ${path}, goes to the top of that page and nowhere else`, async ({
      page,
    }) => {
      await gotoAndReady(page, path)
      await pageHydrated(page)
      await goToFoot(page)
      const addressBefore = page.url()
      await page.locator('.footer__go-to-top').click()

      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0)
      expect(page.url()).toBe(addressBefore)
    })
  }

  test('a visitor who asked for less motion is taken there without the glide', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    // The about section's button, since it is there on every size of screen.
    await bringIntoView(page.locator('#about button').first())

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
    await page.locator('#about button').first().click()
    await arrivesAt(page, 'barbershops')

    // Where it started and where it stopped, and nowhere between.
    await expect(page.locator('html')).toHaveAttribute('data-places-passed', /^[12]$/, {
      timeout: 10_000,
    })
  })
})
