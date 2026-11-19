import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** The part of package-lock.json this test reads. */
interface Lockfile {
  packages: Record<string, { version?: string }>
}

function read(path: string): string {
  return readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')
}

const lockfile: Lockfile = JSON.parse(read('package-lock.json'))
const installed = lockfile.packages['node_modules/@playwright/test']?.version
const images = [...read('.github/workflows/ci.yml').matchAll(/^\s*image:\s*(\S+)/gm)].map(
  ([, image]) => image
)

describe('The image CI runs the browser tests in', () => {
  it('is named by at least one job, so the check below has something to check', () => {
    expect(images.length).toBeGreaterThan(0)
  })

  // The image holds the browsers of one Playwright version. The tests are run
  // by the version in the lockfile, and it refuses any other version's browsers.
  it.each(images)('%s is the Playwright image for the installed version', (image) => {
    expect(installed).toMatch(/^\d+\.\d+\.\d+$/)
    expect(image).toBe(`mcr.microsoft.com/playwright:v${installed}-noble`)
  })
})
