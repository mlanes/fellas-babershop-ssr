import { expect, test, type Page } from '@playwright/test'
import { gotoAndReady, localeCookie } from '../e2e/helpers'

/**
 * Waits until the site's service worker is installed and answering this
 * page's requests, which is the state every returning visitor is in.
 *
 * @throws after 30 seconds if no service worker takes control
 */
async function serviceWorkerInControl(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null), {
      timeout: 30_000,
    })
    .toBe(true)
}

// Addresses end in a slash here, as Netlify serves them. The worker keeps its
// own copies under addresses without one, so the two forms take different paths.
test.describe('A returning visitor, whose browser has the service worker', () => {
  // The worker used to answer every page request with its copy of the home page.
  test('gets a page in the language its address names', async ({ page }) => {
    await gotoAndReady(page, '/')
    await serviceWorkerInControl(page)

    await gotoAndReady(page, '/fr/services/')

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR')
    await expect(page.locator('.coming-soon__back')).toHaveText("Retour à l'accueil")
  })

  test("gets another language's home page in that language", async ({ page }) => {
    await gotoAndReady(page, '/')
    await serviceWorkerInControl(page)

    await gotoAndReady(page, '/fr/')

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR')
    await expect(page.locator('.footer__link').first()).toHaveText('Accueil')
  })

  test('is taken from the home address to the language they picked, and it is shown', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL is not configured')
    await gotoAndReady(page, '/services')
    await serviceWorkerInControl(page)
    await context.addCookies([{ name: localeCookie, value: 'fr', url: baseURL }])

    await gotoAndReady(page, '/')

    await expect(page).toHaveURL(/\/fr\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR')
    await expect(page.locator('.footer__link').first()).toHaveText('Accueil')
  })

  test('sees a page visited before in its language without a connection', async ({
    page,
    context,
  }) => {
    await gotoAndReady(page, '/en/')
    await serviceWorkerInControl(page)
    // The visit that puts the page in the worker's cache.
    await page.reload({ waitUntil: 'load' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            (await caches.match(window.location.href, { ignoreSearch: true })) !== undefined
        )
      )
      .toBe(true)

    await context.setOffline(true)
    await page.reload({ waitUntil: 'domcontentloaded' })

    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect(page.locator('.footer__link').first()).toHaveText('Home')
  })
})
