import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

/** One accessibility rule a scan found broken, cut down to what a failure message needs. */
export interface BlockingViolation {
  id: string
  impact: string
  help: string
  helpUrl: string
  nodeCount: number
  firstNode: string
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
  return violations
    .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? '',
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodeCount: violation.nodes.length,
      firstNode: violation.nodes[0]?.target.flat().join(' ') ?? '',
    }))
}

/**
 * Counts the animations and transitions still changing an element's opacity
 * or colour. Endless ones (pulses, drifts) are left out, and so is anything
 * that only moves an element: WebKit leaves some transform transitions
 * pending forever.
 *
 * axe skips text that is still invisible and reads half-faded text as a
 * contrast violation, so a scan waits for this to reach zero.
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
