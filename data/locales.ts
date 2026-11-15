import type { LocaleDefinition } from '../types/locale'

/**
 * The languages the site is published in. Routing, the language selector, the
 * language tags and the list of prerendered pages are all built from this list.
 * A new language also needs a translation file at `i18n/locales/<code>.json`.
 */
export const locales = [
  { code: 'pt', language: 'pt-PT', name: 'Português', flag: '🇵🇹' },
  { code: 'en', language: 'en-US', name: 'English', flag: '🇬🇧' },
  { code: 'es', language: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', language: 'fr-FR', name: 'Français', flag: '🇫🇷' },
] as const satisfies readonly LocaleDefinition[]

export type Locale = (typeof locales)[number]['code']

/** The language of addresses that name none, such as `/` and `/services`. */
export const defaultLocale: Locale = 'pt'

/** The language shown to a visitor whose browser asks for none of the site's languages. */
export const fallbackLocale: Locale = 'en'

/** The cookie the visitor's chosen language is saved in. */
export const localeCookie = 'i18n_redirected'

/**
 * Gives the address of a page in a language.
 *
 * @param page - the page's address in the default language, e.g. `/` or `/services`
 * @param locale - the language wanted
 * @returns the address, e.g. `/en` or `/en/services`; unchanged for the default language
 */
export function localizedPath(page: string, locale: Locale): string {
  if (locale === defaultLocale) return page
  return page === '/' ? `/${locale}` : `/${locale}${page}`
}
