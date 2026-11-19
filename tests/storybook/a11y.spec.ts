import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { blockingViolations, paintedTheme, unfinishedFades } from '../accessibility'

/**
 * Scans every Storybook story with axe, in both themes.
 *
 * The page tests only see a component as the pages happen to use it. A story
 * shows it in the states the pages do not: disabled, every size, every variant.
 *
 * The stories are read from the built Storybook's own list, so a new story is
 * tested without being added anywhere.
 */
const themes = ['light', 'dark'] as const

// Storybook starts the whole Nuxt app, and its PWA plugin asks for the site's
// service worker. A Storybook build has none, so the browser logs this on
// every story, whatever the story is.
const noServiceWorker = "The script has an unsupported MIME type ('text/html')."

interface Story {
  id: string
  title: string
  name: string
}

declare global {
  interface Window {
    /** Storybook's preview, as far as this spec reads it: the settings a story was opened with. */
    __STORYBOOK_PREVIEW__?: {
      storyStoreValue?: { userGlobals?: { globals?: { a11y?: { manual?: boolean } } } }
    }
  }
}

const stories = builtStories()

for (const story of stories) {
  for (const theme of themes) {
    test(`${story.title} / ${story.name} has no critical or serious axe violations in ${theme} theme`, async ({
      page,
    }) => {
      // When a component throws, Storybook reports it and still shows whatever
      // else the story drew, which would then be scanned and pass.
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error' && message.text() !== noServiceWorker) {
          errors.push(message.text())
        }
      })

      // a11y.manual stops the addon scanning the story itself; see below.
      await page.goto(
        `/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme};a11y.manual:!true`
      )
      // The server answers an unknown story with this same page, and Storybook
      // then shows an empty one that would pass any scan.
      await expect(page.locator('body')).toHaveClass(/sb-show-main/)
      await expect(page.locator('#storybook-root > *').first()).toBeAttached()
      expect(await paintedTheme(page)).toBe(theme)
      await expect.poll(() => unfinishedFades(page), { timeout: 15_000 }).toBe(0)

      // Storybook's accessibility addon scans each story about 200 ms after
      // it renders, and axe refuses to start while another scan is running on
      // the page. On a slow machine that scan was under way when this one
      // began, and the test failed with "Axe is already running".
      expect(await addonScanIsOff(page)).toBe(true)
      expect(await blockingViolations(page)).toEqual([])
      expect(errors).toEqual([])
    })
  }
}

/**
 * Says whether the story was opened with the accessibility addon's own scan
 * switched off, read from the settings Storybook applied to the story.
 */
async function addonScanIsOff(page: Page): Promise<boolean> {
  return await page.evaluate(
    () => window.__STORYBOOK_PREVIEW__?.storyStoreValue?.userGlobals?.globals?.a11y?.manual === true
  )
}

/**
 * Lists the stories in the built Storybook. Documentation pages are left out:
 * they are Storybook's own layout around the same components.
 *
 * @throws if Storybook has not been built, or its list holds no story
 */
function builtStories(): Story[] {
  const indexFile = fileURLToPath(new URL('../../storybook-static/index.json', import.meta.url))
  let index: unknown
  try {
    index = JSON.parse(readFileSync(indexFile, 'utf8'))
  } catch (cause) {
    throw new Error(
      `No built Storybook at ${indexFile}. "npm run test:stories" builds one before the tests are listed; Playwright's UI mode and --list do not, so run "npm run build-storybook" first.`,
      { cause }
    )
  }
  if (!hasEntries(index)) throw new Error(`${indexFile} has no "entries" object`)
  const found = Object.values(index.entries).filter(isStory)
  if (found.length === 0) throw new Error(`${indexFile} lists no story`)
  return found
}

function hasEntries(index: unknown): index is { entries: Record<string, unknown> } {
  return (
    typeof index === 'object' &&
    index !== null &&
    'entries' in index &&
    typeof index.entries === 'object' &&
    index.entries !== null
  )
}

function isStory(entry: unknown): entry is Story {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'type' in entry &&
    entry.type === 'story' &&
    'id' in entry &&
    typeof entry.id === 'string' &&
    'title' in entry &&
    typeof entry.title === 'string' &&
    'name' in entry &&
    typeof entry.name === 'string'
  )
}
