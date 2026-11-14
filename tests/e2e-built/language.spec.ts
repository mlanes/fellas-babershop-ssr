import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { gotoAndReady, homeLabel, type SiteLocale } from '../e2e/helpers'

const cookieName = 'i18n_redirected'

/** Asserts the page has settled in a locale: the `<html lang>` and a translated label. */
async function expectLocale(page: Page, locale: SiteLocale) {
  // The page arrives in the build's language and switches once it has hydrated.
  await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${locale}`), {
    timeout: 15_000,
  })
  await expect(page.locator('.footer__link').first()).toHaveText(homeLabel(locale))
}

async function savedLocale(context: BrowserContext, baseURL: string): Promise<string | undefined> {
  const cookies = await context.cookies(baseURL)
  return cookies.find((cookie) => cookie.name === cookieName)?.value
}

test.describe('Language on the built site, English browser', () => {
  test.use({ locale: 'en-US' })

  test('a saved Spanish choice is honoured and kept', async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL is not configured')
    await context.addCookies([{ name: cookieName, value: 'es', url: baseURL }])
    await gotoAndReady(page, '/')

    await expectLocale(page, 'es')
    expect(await savedLocale(context, baseURL)).toBe('es')
  })

  test('a language picked in the selector survives a reload', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL is not configured')
    await gotoAndReady(page, '/')
    await expectLocale(page, 'en')

    const option = page.locator('.language-selector__option', { hasText: 'Español' })
    // A click before hydration is ignored, so click until the dropdown opens.
    await expect(async () => {
      if ((await option.count()) === 0) {
        await page.locator('.language-selector__button:visible').first().click({ timeout: 2000 })
      }
      await expect(option).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await option.click()
    await expectLocale(page, 'es')

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectLocale(page, 'es')
    expect(await savedLocale(context, baseURL)).toBe('es')
  })
})

test.describe('Language on the built site, Portuguese browser', () => {
  test.use({ locale: 'pt-PT' })

  test('a first visit is shown in Portuguese', async ({ page }) => {
    await gotoAndReady(page, '/')
    await expectLocale(page, 'pt')
  })
})
