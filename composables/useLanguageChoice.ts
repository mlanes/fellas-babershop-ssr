import { localeCookie, locales, type Locale } from '~/data/locales'

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

/**
 * Keeps the language the visitor picked in the selector, in a cookie. Only a
 * pick is saved: a page merely opened in a language does not count.
 *
 * @returns `chosen`, the picked language, or `undefined` when the visitor has
 *   picked none; and `choose`, which saves a pick
 */
export function useLanguageChoice() {
  const saved = useCookie<string | null>(localeCookie, {
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: 'lax',
    path: '/',
  })

  return {
    chosen: computed<Locale | undefined>(
      () => locales.find(({ code }) => code === saved.value)?.code
    ),
    choose: (locale: Locale) => {
      saved.value = locale
    },
  }
}
