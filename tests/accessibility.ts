import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

/** The site's two themes. */
export type Theme = 'light' | 'dark'

type Rgb = [number, number, number]

/** One accessibility rule a scan found broken, cut down to what a failure message needs. */
export interface BlockingViolation {
  id: string
  impact: 'critical' | 'serious'
  help: string
  helpUrl: string
  /** A CSS selector for each element that breaks the rule */
  elements: string[]
  /** axe's explanation for the first of them; for contrast, the two colours and their ratio */
  firstFailure: string
}

/**
 * Scans the page with axe against WCAG 2.1 A and AA and returns what must be
 * fixed: the violations axe marks critical or serious. Moderate and minor ones
 * are left out, so a failing scan always means work and never noise.
 *
 * The pages and the Storybook stories are both held to this one bar.
 *
 * @param page - a page that has loaded and finished fading in
 * @returns one entry per rule broken; empty when the page passes
 * @example
 * expect(await blockingViolations(page)).toEqual([])
 */
export async function blockingViolations(page: Page): Promise<BlockingViolation[]> {
  const { violations } = await new AxeBuilder({ page })
    // The dev server injects a DevTools badge that is not part of the site.
    .exclude('nuxt-devtools-frame')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return violations.flatMap((violation) =>
    violation.impact === 'critical' || violation.impact === 'serious'
      ? [
          {
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            helpUrl: violation.helpUrl,
            elements: violation.nodes.map((node) => node.target.flat().join(' ')),
            firstFailure: violation.nodes[0]?.failureSummary ?? '',
          },
        ]
      : []
  )
}

/**
 * Counts the animations and transitions still changing an element's opacity
 * or colour. Endless ones (pulses, drifts) are left out, and so is anything
 * that only moves an element: WebKit leaves some transform transitions
 * pending forever.
 *
 * axe skips text that is still invisible and reads half-faded text as a
 * contrast violation, so a scan waits for this to reach zero.
 *
 * @param page - the page to look at
 * @returns how many are still running; 0 once the page is still
 */
export async function unfinishedFades(page: Page): Promise<number> {
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
export async function textContrast(page: Page, selector: string): Promise<number> {
  const { text, backdrop } = await textAndBackdropLuminance(page, selector)
  const [lighter, darker] = [text, backdrop].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Reports which theme the page is actually painted in, judged by whether the
 * body background is darker than the body text. The `data-theme` attribute
 * only says which theme was asked for; a stylesheet that failed to load would
 * leave both themes painted alike, and a scan of "dark" would pass on light.
 *
 * @param page - a page whose body has a background colour and a text colour
 * @returns the theme on screen
 * @throws if the body's colours cannot be read
 */
export async function paintedTheme(page: Page): Promise<Theme> {
  const { text, backdrop } = await textAndBackdropLuminance(page, 'body')
  return backdrop < text ? 'dark' : 'light'
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
