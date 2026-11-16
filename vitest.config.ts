import { defineConfig } from 'vitest/config'

/**
 * Unit tests: plain functions, run in Node with no browser and no Nuxt app
 * ("npm run test:unit"). What needs a page is tested by the Playwright suites.
 */
export default defineConfig({
  test: {
    // Vitest's own pattern would also pick up the Playwright specs.
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
