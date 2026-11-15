import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { gotoAndReady, openLanguageMenu, pageHydrated } from './helpers'

/**
 * Automated WCAG 2.1 A/AA accessibility scan via axe-core.
 *
 * Asserts that no axe violations marked `critical` or `serious` exist
 * on the page. `moderate` and `minor` violations are not reported and
 * don't fail the build — keeping the bar at "must-fix" stops the
 * suite turning into a perpetual noise generator.
 */
const routes = ['/', '/services', '/gallery', '/contacts', '/score']
const themes = ['light', 'dark'] as const
const hoveredText = [
  { name: 'coming-soon back button', route: '/services', selector: '.coming-soon__back' },
  { name: 'footer nav link', route: '/', selector: '.footer__link' },
  { name: 'footer contact link', route: '/', selector: '.footer__contact' },
]

async function scan(page: Parameters<typeof gotoAndReady>[0]) {
  // The dev server injects a DevTools badge that is not part of the site.
  return await new AxeBuilder({ page })
    .exclude('nuxt-devtools-frame')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
}

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
        const { violations } = await scan(page)
        const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
        if (blocking.length) {
          // eslint-disable-next-line no-console
          console.log(`axe violations on ${route} (${theme}):`, formatViolations(blocking))
        }
        expect(blocking).toEqual([])
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
      const { violations } = await scan(page)
      const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
      if (blocking.length) {
        // eslint-disable-next-line no-console
        console.log(`axe violations (mobile menu open, ${theme}):`, formatViolations(blocking))
      }
      expect(blocking).toEqual([])
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

type Rgb = [number, number, number]
type Theme = (typeof themes)[number]

/**
 * Measures the WCAG contrast ratio of an element's text colour against the
 * background colours of the element and its ancestors, stacked from the page up.
 * The element's own opacity is applied. Not taken into account: background
 * images, gradients, pseudo-elements, the opacity of ancestors, and whatever
 * page content shows through a translucent fixed ancestor such as the header.
 *
 * @param page - the page holding the element
 * @param selector - CSS selector; the first match is measured
 * @returns the contrast ratio, from 1 (none) to 21 (black on white)
 * @throws if the selector matches nothing, the browser cannot parse one of the
 *   colours, or the stacked background is not opaque
 */
async function textContrast(page: Page, selector: string): Promise<number> {
  const { text, backdrop } = await textAndBackdropLuminance(page, selector)
  const [lighter, darker] = [text, backdrop].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Reports which theme the page is actually painted in, judged by whether the
 * body background is darker than the body text.
 */
async function paintedTheme(page: Page): Promise<Theme> {
  const { text, backdrop } = await textAndBackdropLuminance(page, 'body')
  return backdrop < text ? 'dark' : 'light'
}

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

/**
 * Counts the animations and transitions still changing an element's opacity
 * or colour. Endless ones (pulses, drifts) are left out, and so is anything
 * that only moves an element: WebKit leaves some transform transitions
 * pending forever.
 */
async function unfinishedFades(page: Page): Promise<number> {
  return await page.evaluate(
    () =>
      document.getAnimations().filter((animation) => {
        const effect = animation.effect
        if (!(effect instanceof KeyframeEffect)) return false
        // A finished transition leaves the list once its last frame is painted.
        // WebKit was measured listing one as finished with its element still at
        // 54% opacity, so a listed one counts. A finished animation that keeps
        // its end state stays listed for good, and does not.
        const painted = animation.playState === 'finished' && !(animation instanceof CSSTransition)
        if (painted) return false
        if (effect.getComputedTiming().endTime === Infinity) return false
        return effect
          .getKeyframes()
          .some(
            (keyframe) =>
              'opacity' in keyframe || 'color' in keyframe || 'backgroundColor' in keyframe
          )
      }).length
  )
}

async function textAndBackdropLuminance(
  page: Page,
  selector: string
): Promise<{ text: number; backdrop: number }> {
  await page.locator(selector).first().waitFor({ state: 'attached' })
  const { text, backdrop, behind, opacity } = await page.evaluate((target) => {
    const flatten = (layers: string[]): [number, number, number] => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('2d canvas unavailable')
      for (const layer of layers) {
        // An unparseable fillStyle is ignored silently and would repaint the previous layer.
        if (!CSS.supports('color', layer)) throw new Error(`cannot parse colour: ${layer}`)
        ctx.fillStyle = layer
        ctx.fillRect(0, 0, 1, 1)
      }
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      if (a !== 255) throw new Error(`backdrop is not opaque: ${layers.join(' under ')}`)
      return [r, g, b]
    }
    const element = document.querySelector(target)
    if (!element) throw new Error(`${target} not found`)
    const ancestors: string[] = []
    for (let node = element.parentElement; node; node = node.parentElement) {
      ancestors.unshift(getComputedStyle(node).backgroundColor)
    }
    const style = getComputedStyle(element)
    const own = [...ancestors, style.backgroundColor]
    const opacity = Number(style.opacity)
    return {
      text: flatten([...own, style.color]),
      backdrop: flatten(own),
      behind: opacity < 1 ? flatten(ancestors) : null,
      opacity,
    }
  }, selector)
  const mix = (front: number, back: number) => front * opacity + back * (1 - opacity)
  const seeThrough = (rgb: Rgb): Rgb =>
    behind ? [mix(rgb[0], behind[0]), mix(rgb[1], behind[1]), mix(rgb[2], behind[2])] : rgb
  return {
    text: relativeLuminance(seeThrough(text)),
    backdrop: relativeLuminance(seeThrough(backdrop)),
  }
}

function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
