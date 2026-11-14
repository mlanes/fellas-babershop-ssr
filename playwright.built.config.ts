import { defineConfig } from '@playwright/test'
import devConfig from './playwright.config'

const port = 3100
const baseURL = `http://localhost:${port}`

/**
 * Runs the specs in tests/e2e-built against the built, prerendered site.
 *
 * The dev server renders every request afresh, with the visitor's cookies and
 * headers in hand. The live site serves pages rendered once at build time, so
 * anything decided during that render (the language, for one) only shows up
 * here.
 */
export default defineConfig({
  testDir: './tests/e2e-built',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: devConfig.projects,
  webServer: {
    command: 'npm run build && node .output/server/index.mjs',
    url: baseURL,
    env: { PORT: String(port) },
    // Never reuse: a server left running would serve an older build.
    reuseExistingServer: false,
    timeout: 240_000,
  },
})
