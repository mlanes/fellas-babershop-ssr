import { expect, test } from '@playwright/test'
import { gotoAndReady } from './helpers'

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
