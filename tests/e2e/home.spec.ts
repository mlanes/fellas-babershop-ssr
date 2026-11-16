import { expect, test } from '@playwright/test'
import { gotoAndReady, pageHydrated } from './helpers'

test.describe('Home page', () => {
  test('loads with the expected title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Fellas/i)
  })

  test('renders the hero and key sections', async ({ page }) => {
    await gotoAndReady(page, '/')

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()

    const sections = ['#about', '#services', '#gallery', '#barbershops']
    for (const id of sections) {
      await expect(page.locator(id)).toHaveCount(1)
    }
  })

  // The logo SVGs carry a fixed near-white fill that the stylesheet swaps for
  // the theme's text colour; an SVG optimiser that rewrites the colour value
  // breaks that match and leaves them near-white on the light page.
  for (const theme of ['light', 'dark'] as const) {
    for (const { name, svg } of [
      { name: 'footer logo', svg: '.footer__logo svg' },
      { name: 'about badge', svg: '.about__badge-svg' },
    ]) {
      test(`${name} takes the theme text colour in ${theme} theme`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme })
        await gotoAndReady(page, '/')
        await page.locator(svg).first().waitFor({ state: 'attached' })

        const { expected, painted } = await page.evaluate((svgSelector) => {
          const root = document.querySelector(svgSelector)
          if (!root) throw new Error('logo markup not found')
          // A fresh element gives the token's colour without any transition in flight.
          const probe = document.createElement('span')
          probe.style.color = 'var(--text-color-primary)'
          document.body.append(probe)
          const expected = getComputedStyle(probe).color
          probe.remove()
          const themed = (attribute: 'fill' | 'stroke') =>
            [...root.querySelectorAll('path')]
              .filter((path) => path.getAttribute(attribute)?.toLowerCase() === '#f7f9fc')
              .map((path) => getComputedStyle(path)[attribute])
          return { expected, painted: [...themed('fill'), ...themed('stroke')] }
        }, svg)

        expect(painted.length).toBeGreaterThan(0)
        expect([...new Set(painted)]).toEqual([expected])
      })
    }
  }

  test('has at least one external booking link', async ({ page }) => {
    await gotoAndReady(page, '/')
    const bookingLinks = page.locator('a[href*="appbarber"], a[href*="booking"]')
    await expect(bookingLinks.first()).toBeVisible()
  })
})

// The hero has one video for wide screens and one for phones; the stylesheet
// shows one of them. Loading both cost a phone about four megabytes for a
// video it never showed.
test.describe('Hero video', () => {
  const screens = [
    {
      screen: 'a phone',
      viewport: { width: 390, height: 844 },
      shown: '.hero__video--mobile',
      hidden: '.hero__video--desktop',
    },
    {
      screen: 'a wide screen',
      viewport: { width: 1440, height: 900 },
      shown: '.hero__video--desktop',
      hidden: '.hero__video--mobile',
    },
  ]

  for (const { screen, viewport, shown, hidden } of screens) {
    test(`on ${screen}, the video shown there plays and the other is not loaded`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await gotoAndReady(page, '/')
      await pageHydrated(page)

      // The element says what it has loaded; WebKit does not report media
      // requests to the test.
      await expect
        .poll(() =>
          page
            .locator(shown)
            .evaluate((video: HTMLVideoElement) => !video.paused && video.readyState >= 2)
        )
        .toBe(true)

      await page.waitForTimeout(1500)
      const hiddenVideo = await page.locator(hidden).evaluate((video: HTMLVideoElement) => ({
        paused: video.paused,
        readyState: video.readyState,
        buffered: video.buffered.length,
      }))
      expect(hiddenVideo).toEqual({ paused: true, readyState: 0, buffered: 0 })
    })
  }
})
