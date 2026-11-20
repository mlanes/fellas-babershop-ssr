import { expect, test } from '@playwright/test'
import { gotoAndReady, pageHydrated } from '../e2e/helpers'

/**
 * How things are painted in the built site, where it differs from the dev
 * server.
 *
 * An icon is a component of its own, and a section colours it through a class
 * it puts on that component. The built pages mark the icon as the section's so
 * that the section's styles reach it; the dev server does not, and paints the
 * same icons in the plain text colour. So only a test here can see whether a
 * visitor gets the section's colours.
 */
test.describe('The rating under a testimonial, as the built site paints it', () => {
  test('has its earned stars filled in, and in a colour of their own', async ({ page }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    const showing = page.locator('.testimonials__content--showing')
    const filled = showing.locator('.testimonials__star--filled')
    await expect(filled.first()).toBeAttached()

    const paint = await filled.evaluateAll((stars) =>
      stars.map((star) => {
        const shape = star.querySelector('svg')
        return {
          colour: getComputedStyle(star).color,
          fill: shape ? getComputedStyle(shape).fill : 'no svg',
        }
      })
    )
    const words = await showing
      .locator('.testimonials__comment')
      .evaluate((comment) => getComputedStyle(comment).color)

    expect(paint.length).toBeGreaterThan(0)
    for (const star of paint) {
      expect(star.fill, 'a filled star is filled with its own colour').toBe(star.colour)
      expect(star.colour, "the stars are not the colour of the review's words").not.toBe(words)
    }
  })
})
