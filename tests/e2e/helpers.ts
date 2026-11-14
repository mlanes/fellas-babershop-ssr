import { readFileSync } from 'node:fs'
import { type Page } from '@playwright/test'

export async function gotoAndReady(page: Page, path: string) {
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.textContent = '.app-loader { display: none !important; }'
    document.documentElement.appendChild(style)
  })
  await page.goto(path, { waitUntil: 'domcontentloaded' })
}

export type SiteLocale = 'pt' | 'en' | 'es' | 'fr'

/**
 * Returns the "Home" navigation label in a locale, read from its translation
 * file, so a spec can tell which language a page is showing.
 *
 * @param locale - one of the site's four locales
 * @returns the label as written in `i18n/locales/<locale>.json`
 * @throws if the file is missing or has no `nav.home` entry
 */
export function homeLabel(locale: SiteLocale): string {
  const messages: { nav?: { home?: string } } = JSON.parse(
    readFileSync(`i18n/locales/${locale}.json`, 'utf8')
  )
  const label = messages.nav?.home
  if (!label) throw new Error(`nav.home is missing from the ${locale} translations`)
  return label
}
