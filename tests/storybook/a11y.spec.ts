import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { blockingViolations, unfinishedFades } from '../accessibility'

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

interface Story {
  id: string
  title: string
  name: string
}

const stories = builtStories()

for (const story of stories) {
  for (const theme of themes) {
    test(`${story.title} / ${story.name} has no critical or serious axe violations in ${theme} theme`, async ({
      page,
    }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`)
      // The server answers an unknown story with this same page, and Storybook
      // then shows an empty one that would pass any scan.
      await expect(page.locator('body')).toHaveClass(/sb-show-main/)
      await expect(page.locator('#storybook-root > *').first()).toBeAttached()
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      await expect.poll(() => unfinishedFades(page), { timeout: 15_000 }).toBe(0)

      expect(await blockingViolations(page)).toEqual([])
    })
  }
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
      `No built Storybook at ${indexFile}. Run "npm run test:stories", which builds it first.`,
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
