import { defineConfig, devices } from '@playwright/test'

const port = 6106
const baseURL = `http://localhost:${port}`

/**
 * Runs the specs in tests/storybook against a built Storybook.
 *
 * Run it with "npm run test:stories", which builds Storybook first: the spec
 * reads the list of stories from the build before this server starts.
 *
 * One browser only. axe judges the markup and the computed colours, which the
 * page suites already check in five browsers for every component a page uses.
 */
export default defineConfig({
  testDir: './tests/storybook',
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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Vite comes with Nuxt; its preview command serves a folder as it is.
    command: `npx vite preview --outDir storybook-static --port ${port} --strictPort`,
    url: `${baseURL}/index.json`,
    // Never reuse: a server left running could be serving another folder.
    reuseExistingServer: false,
  },
})
