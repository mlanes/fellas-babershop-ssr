import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { gotoAndReady, localeCookie, openLanguageMenu } from '../e2e/helpers'

/**
 * Asserts the page has settled in a language: the `<html lang>` and the first
 * footer link, which is the translated "Home" label.
 */
async function expectLanguage(page: Page, lang: string, homeLabel: string) {
  // The page arrives in the build's language and switches once it has hydrated.
  await expect(page.locator('html')).toHaveAttribute('lang', lang, { timeout: 15_000 })
  await expect(page.locator('.footer__link').first()).toHaveText(homeLabel)
}

/** Reads the `<html lang>` of the page as built, before any script has run. */
async function builtLanguage(page: Page): Promise<string | undefined> {
  const html = await (await page.request.get('/')).text()
  return /<html[^>]*\blang="([^"]*)"/.exec(html)?.[1]
}

/**
 * Asserts the page switched to a language after loading. It first checks the
 * build did not already render that language, because then the page would
 * match without the site having honoured anything.
 */
async function expectSwitchTo(page: Page, lang: string, homeLabel: string) {
  expect(await builtLanguage(page)).not.toBe(lang)
  await expectLanguage(page, lang, homeLabel)
}

async function savedLocale(context: BrowserContext, baseURL: string): Promise<string | undefined> {
  const cookies = await context.cookies(baseURL)
  return cookies.find((cookie) => cookie.name === localeCookie)?.value
}

test.describe('Language on the built site, English browser', () => {
  test.use({ locale: 'en-US' })

  test('a saved Spanish choice is honoured and kept', async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL is not configured')
    await context.addCookies([{ name: localeCookie, value: 'es', url: baseURL }])
    await gotoAndReady(page, '/')

    await expectSwitchTo(page, 'es-ES', 'Inicio')
    expect(await savedLocale(context, baseURL)).toBe('es')

    // A second load shows whether anything overwrote the choice after the
    // first. The pause gives a late write the time to happen; a reload straight
    // away would cancel it.
    await page.waitForTimeout(1500)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectSwitchTo(page, 'es-ES', 'Inicio')
    expect(await savedLocale(context, baseURL)).toBe('es')
  })

  test('a language picked in the selector survives a reload', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL is not configured')
    await gotoAndReady(page, '/')
    await expectLanguage(page, 'en-US', 'Home')

    const dropdown = await openLanguageMenu(page)
    await dropdown.locator('.language-selector__option', { hasText: 'Español' }).click()
    await expectLanguage(page, 'es-ES', 'Inicio')

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectSwitchTo(page, 'es-ES', 'Inicio')
    expect(await savedLocale(context, baseURL)).toBe('es')
  })
})

test.describe('Language on the built site, Portuguese browser', () => {
  test.use({ locale: 'pt-PT' })

  test('a first visit is shown in Portuguese', async ({ page }) => {
    await gotoAndReady(page, '/')
    await expectSwitchTo(page, 'pt-PT', 'Início')
  })
})
