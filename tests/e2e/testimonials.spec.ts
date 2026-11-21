import { expect, test, type Page } from '@playwright/test'
import { gotoAndReady, pageHydrated } from './helpers'

interface Showing {
  /** The review's words */
  words: string
  /** How tall the card around it is, in pixels */
  height: number
  /** Whether it has finished coming in */
  arrived: boolean
}

/** The testimonial on show, and the card around it. */
async function shown(page: Page): Promise<Showing> {
  const showing = page.locator('.testimonials__content--showing')
  // textContent and not innerText, which is empty for the half second the
  // review on its way in is still hidden.
  const words = (await showing.locator('.testimonials__comment').textContent()) ?? ''
  const arrived = await showing.evaluate((review) => {
    const style = getComputedStyle(review)
    return style.visibility === 'visible' && style.opacity === '1'
  })
  // The card and not the section: on a wide screen the section is as tall as
  // the window whatever is in it, and would say nothing.
  const height = await page
    .locator('.testimonials__featured')
    .evaluate((card) => Math.round(card.getBoundingClientRect().height))
  return { words: words.trim(), height, arrived }
}

/**
 * Asks for the next testimonial and waits until it is the one on show.
 *
 * @returns the testimonial now showing, once it has stopped changing
 */
async function next(page: Page, before: string): Promise<Showing> {
  await page.locator('.testimonials__nav-button--active').click()
  let previous = ''
  let now: Showing = { words: before, height: 0, arrived: false }
  await expect(async () => {
    now = await shown(page)
    const settled = `${now.words}|${now.height}` === previous
    previous = `${now.words}|${now.height}`
    expect(now.words).not.toBe(before)
    expect(now.arrived).toBe(true)
    expect(settled).toBe(true)
  }).toPass({ intervals: [200], timeout: 10_000 })
  return now
}

test.describe('The testimonials', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndReady(page, '/')
    await pageHydrated(page)
    // A font arriving after the first measurement would change every later one.
    await page.evaluate(() => document.fonts.ready)
    await page.locator('#testimonials').evaluate((section) => {
      section.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    await expect(page.locator('.testimonials__content--showing')).toHaveCount(1)
  })

  test('take up the same room whichever one is showing', async ({ page }) => {
    // A long review wraps on to more lines than a short one. If the card grows
    // and shrinks with it, everything beside and below moves each time they
    // change, which they do by themselves every five seconds.
    const all = await page.locator('.testimonials__content').count()
    let current = await shown(page)
    const seen = [current]
    while (seen.filter((one) => one.words === current.words).length < 2 && seen.length < 30) {
      current = await next(page, current.words)
      seen.push(current)
    }

    expect(all).toBeGreaterThan(1)
    expect(new Set(seen.map((one) => one.words)).size, 'every testimonial was looked at').toBe(all)
    expect([...new Set(seen.map((one) => one.height))]).toHaveLength(1)
  })

  test('show one at a time, to the eye and to a screen reader', async ({ page }) => {
    const all = await page.locator('.testimonials__content').count()
    const first = await shown(page)
    await page.locator('.testimonials__nav-button--active').click()

    // From the click itself, before the one going out has faded: a screen
    // reader is told about one only, and never about two.
    await expect(page.locator('.testimonials__content[aria-hidden="true"]')).toHaveCount(all - 1)
    await expect(page.locator('#testimonials').getByRole('img', { name: /\d/ })).toHaveCount(1)

    // And to the eye, once the change is over.
    await expect(
      page.locator('.testimonials__content--showing .testimonials__comment')
    ).not.toHaveText(first.words)
    await expect
      .poll(() =>
        page
          .locator('.testimonials__content')
          .evaluateAll(
            (reviews) =>
              reviews.filter((one) => getComputedStyle(one).visibility === 'visible').length
          )
      )
      .toBe(1)
  })

  test('change at once for a visitor who asked for less motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const first = await shown(page)

    // For this visitor the fades are already cut to nothing. What would leave
    // the card empty is a review waiting half a second before it comes in, so
    // it is the waits that are read here. Timing the change with a clock was
    // tried first, and a slow machine failed it for nothing.
    const waits = await page.locator('.testimonials__content').evaluateAll((reviews) =>
      reviews.flatMap((one) =>
        getComputedStyle(one)
          .transitionDelay.split(',')
          .map((wait) => Number.parseFloat(wait))
      )
    )
    expect(waits.length).toBeGreaterThan(0)
    expect(waits.filter((wait) => wait !== 0)).toEqual([])

    const now = await next(page, first.words)
    expect(now.arrived).toBe(true)
  })
})
