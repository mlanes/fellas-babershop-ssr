import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { browserTestsNeeded } from '../../scripts/browserTestsNeeded'

describe('Whether a change needs the browser jobs in CI', () => {
  it.each([
    { paths: ['CHANGELOG.md'], why: 'one Markdown file' },
    { paths: ['README.md', 'docs/quality-roadmap.md'], why: 'several, in folders too' },
    { paths: ['assets/icons/README.MD'], why: 'the ending in capitals' },
  ])('$paths does not: $why', ({ paths }) => {
    expect(browserTestsNeeded(paths)).toBe(false)
  })

  it.each([
    { paths: ['nuxt.config.ts'], why: 'code' },
    { paths: ['CHANGELOG.md', 'utils/testimonials.ts'], why: 'code beside a Markdown file' },
    { paths: ['components/ui/FButton.stories.ts'], why: 'a story' },
    { paths: ['.github/workflows/ci.yml'], why: 'the workflow itself' },
    { paths: ['public/images/hero.jpg'], why: 'a picture the site serves' },
    { paths: ['docs/guide.mdx'], why: '".mdx" is not ".md"' },
    { paths: ['notes.md.bak'], why: '".md" is not the ending' },
    { paths: ['md'], why: 'a file named "md"' },
  ])('$paths does: $why', ({ paths }) => {
    expect(browserTestsNeeded(paths)).toBe(true)
  })

  it('does when no path is given, since the change could not be read', () => {
    expect(browserTestsNeeded([])).toBe(true)
  })
})

describe('The same question, asked the way CI asks it', () => {
  const script = fileURLToPath(new URL('../../scripts/browserTestsNeeded.ts', import.meta.url))

  /** Gives the script a list of changed files, one a line, as `git diff --name-only` prints it. */
  function answerFor(changedFiles: string): string {
    return execFileSync(process.execPath, [script], { input: changedFiles, encoding: 'utf8' })
  }

  it('prints "false" for Markdown alone', () => {
    expect(answerFor('CHANGELOG.md\nREADME.md\n')).toBe('false\n')
  })

  it('prints "true" when anything else changed', () => {
    expect(answerFor('CHANGELOG.md\nnuxt.config.ts\n')).toBe('true\n')
  })

  it('prints "true" for no input at all', () => {
    expect(answerFor('')).toBe('true\n')
  })
})
