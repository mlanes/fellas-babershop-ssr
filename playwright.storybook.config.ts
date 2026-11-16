import { defineConfig, devices } from '@playwright/test'

const port = 6106
const baseURL = `http://localhost:${port}`

/**
 * Runs the specs in tests/storybook against a freshly built Storybook
 * ("npm run test:stories").
 *
 * The server command builds Storybook before serving it. Playwright starts the
 * server before it loads the spec, which reads the list of stories from that
 * build, so a run never scans an older build left on disk.
 *
 * One browser only. axe judges the markup and the computed colours, which the
 * page suites already check in five browsers for every component a page uses.
 */
export default defineConfig({
  testDir: './tests/storybook',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries: a still page scanned twice gives the same answer, so a test
  // that passes only the second time is a fault to look at, not to hide.
  retries: 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Vite comes with Nuxt and its preview command serves a folder as it is.
    // --no stops npx downloading some other Vite if the installed one is gone.
    command: `npm run build-storybook && npx --no vite preview --outDir storybook-static --port ${port} --strictPort`,
    url: `${baseURL}/index.json`,
    // Never reuse: a server left running would serve an older build.
    reuseExistingServer: false,
    // The build comes first: 11 seconds here, longer on a shared CI runner.
    timeout: 300_000,
  },
})
