import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { gotoAndReady } from './helpers'

const locales = ['pt', 'en', 'es', 'fr'] as const

function homeLabelOf(locale: (typeof locales)[number]): string {
  const messages: { nav: { home: string } } = JSON.parse(
    readFileSync(`i18n/locales/${locale}.json`, 'utf8')
  )
  return messages.nav.home
}

const homeLabel = {
  pt: homeLabelOf('pt'),
  en: homeLabelOf('en'),
  es: homeLabelOf('es'),
  fr: homeLabelOf('fr'),
}
const cookieName = 'i18n_redirected'
const origin = 'http://localhost:3000'

/** Asserts the page is shown in a locale: the `<html lang>` and a translated label. */
async function expectLocale(page: Page, locale: (typeof locales)[number]) {
  await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${locale}`), {
    timeout: 10_000,
  })
  // The footer link is rendered on every viewport; the header nav is not.
  await expect(page.locator('.footer__link').first()).toHaveText(homeLabel[locale])
}

test.describe('Language', () => {
  for (const locale of locales) {
    test(`a saved ${locale} choice is honoured on load`, async ({ page, context }) => {
      await context.addCookies([{ name: cookieName, value: locale, url: origin }])
      await gotoAndReady(page, '/')
      await expectLocale(page, locale)
    })
  }

  test('a language chosen in the selector survives a reload', async ({ page, context }) => {
    await context.addCookies([{ name: cookieName, value: 'pt', url: origin }])
    await gotoAndReady(page, '/')
    await expectLocale(page, 'pt')

    const option = page.locator('.language-selector__option', { hasText: 'Español' })
    // A click before hydration is ignored, so click until the dropdown opens.
    await expect(async () => {
      if ((await option.count()) === 0) {
        await page.locator('.language-selector__button:visible').first().click()
      }
      await expect(option).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await option.click()
    await expectLocale(page, 'es')

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectLocale(page, 'es')
  })

  for (const [browserLocale, expected] of [
    ['fr-FR', 'fr'],
    ['es-ES', 'es'],
    ['pt-PT', 'pt'],
    ['de-DE', 'en'],
  ] as const) {
    test(`a first visit from a ${browserLocale} browser is shown in ${expected}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ locale: browserLocale })
      const page = await context.newPage()
      await gotoAndReady(page, `${origin}/`)
      await expectLocale(page, expected)
      await context.close()
    })
  }
})
