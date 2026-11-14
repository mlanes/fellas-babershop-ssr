import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { gotoAndReady } from './helpers'

/**
 * Automated WCAG 2.1 A/AA accessibility scan via axe-core.
 *
 * Asserts that no axe violations marked `critical` or `serious` exist
 * on the page. `moderate` and `minor` violations are logged for review
 * but don't fail the build — keeping the bar at "must-fix" stops the
 * suite turning into a perpetual noise generator.
 */
const routes = ['/', '/services', '/gallery', '/contacts', '/score']

async function scan(page: Parameters<typeof gotoAndReady>[0]) {
  return await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
}

function formatViolations(violations: Awaited<ReturnType<typeof scan>>['violations']) {
  return violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    nodeCount: v.nodes.length,
    firstNode: v.nodes[0]?.target,
  }))
}

test.describe('Accessibility (axe-core)', () => {
  for (const route of routes) {
    test(`${route} has no critical or serious axe violations`, async ({ page }) => {
      await gotoAndReady(page, route)
      const { violations } = await scan(page)
      const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
      if (blocking.length) {
        // eslint-disable-next-line no-console
        console.log(`axe violations on ${route}:`, formatViolations(blocking))
      }
      expect(blocking).toEqual([])
    })
  }

  test('home with mobile menu open has no critical or serious axe violations', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: 'i18n_redirected', value: 'pt', url: 'http://localhost:3000' },
    ])
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoAndReady(page, '/')
    await page.locator('button.header__mobile-toggle').click()
    await page.locator('.header__mobile-menu').waitFor()
    const { violations } = await scan(page)
    const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    if (blocking.length) {
      // eslint-disable-next-line no-console
      console.log('axe violations (mobile menu open):', formatViolations(blocking))
    }
    expect(blocking).toEqual([])
  })

  // axe reports the desktop nav links as "incomplete" (their ::before overlay
  // hides the background from it), so the contrast is measured here instead.
  test('active desktop nav link meets 4.5:1 contrast on the scrolled header in light theme', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoAndReady(page, '/')
    await page.evaluate(() => window.scrollTo(0, 400))
    await page.locator('.header--scrolled').waitFor({ state: 'attached' })
    await page.locator('.header__nav-link--active').waitFor({ state: 'attached' })

    await expect.poll(() => activeNavLinkContrast(page)).toBeGreaterThanOrEqual(4.5)
  })
})

type Rgb = [number, number, number]

/**
 * Measures the WCAG contrast ratio of the active desktop nav link against the
 * header background composited over the page background.
 */
async function activeNavLinkContrast(page: Page): Promise<number> {
  const { text, backdrop } = await page.evaluate(() => {
    const flatten = (...layers: string[]): [number, number, number] => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('2d canvas unavailable')
      for (const layer of layers) {
        ctx.fillStyle = layer
        ctx.fillRect(0, 0, 1, 1)
      }
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      if (a !== 255) throw new Error(`backdrop is not opaque: ${layers.join(' over ')}`)
      return [r, g, b]
    }
    const colorOf = (selector: string, property: 'color' | 'backgroundColor'): string => {
      const element = document.querySelector(selector)
      if (!element) throw new Error(`${selector} not found`)
      return getComputedStyle(element)[property]
    }
    const pageBackground = colorOf('body', 'backgroundColor')
    return {
      text: flatten(pageBackground, colorOf('.header__nav-link--active', 'color')),
      backdrop: flatten(pageBackground, colorOf('.header', 'backgroundColor')),
    }
  })
  const [lighter, darker] = [relativeLuminance(text), relativeLuminance(backdrop)].sort(
    (a, b) => b - a
  )
  return (lighter + 0.05) / (darker + 0.05)
}

function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
