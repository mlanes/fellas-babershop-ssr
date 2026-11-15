import { defineConfig } from '@playwright/test'
import devConfig from './playwright.config'

const port = 3100
const baseURL = `http://localhost:${port}`

/**
 * Runs the specs in tests/e2e-built, and the language-routing spec, against
 * the built, prerendered site.
 *
 * The dev server renders every request afresh, with the visitor's cookies and
 * headers in hand. The live site serves pages rendered once at build time, so
 * anything decided during that render (the language, for one) only shows up
 * here.
 */
export default defineConfig({
  testDir: './tests',
  // The language-routing spec runs in both modes: against the dev server with
  // the rest of tests/e2e, and here against the built site.
  testMatch: ['e2e-built/*.spec.ts', 'e2e/i18n.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'list',
  use: {
    ...devConfig.use,
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: devConfig.projects,
  webServer: {
    command: 'npm run build && node .output/server/index.mjs',
    url: baseURL,
    // The preset is pinned because the command starts the Node server output;
    // a NITRO_PRESET or NETLIFY variable in the shell would build something else.
    env: { PORT: String(port), NITRO_PRESET: 'node-server' },
    // Never reuse: a server left running would serve an older build.
    reuseExistingServer: false,
    timeout: 240_000,
  },
})
