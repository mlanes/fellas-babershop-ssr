import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
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
})
