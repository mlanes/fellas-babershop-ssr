import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Says whether a change needs the browser jobs in CI: the story scan and both
 * Playwright suites.
 *
 * Only a change made of Markdown files alone does not; nothing in the site,
 * its build or its tests reads one. An empty list means the change could not
 * be worked out, and that runs the jobs too.
 *
 * @param changedPaths - the files a pull request or a push changed
 * @returns `false` only when there is at least one path and every one of them
 *   ends in ".md"
 * @example
 * browserTestsNeeded(['CHANGELOG.md']) // false
 * browserTestsNeeded(['CHANGELOG.md', 'nuxt.config.ts']) // true
 */
export function browserTestsNeeded(changedPaths: string[]): boolean {
  return changedPaths.length === 0 || changedPaths.some((path) => !/\.md$/i.test(path))
}

// CI runs this file: git diff --name-only … | node scripts/browserTestsNeeded.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const changedPaths = readFileSync(0, 'utf8').split('\n').filter(Boolean)
  console.log(browserTestsNeeded(changedPaths))
}
