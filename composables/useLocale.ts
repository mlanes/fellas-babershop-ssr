import { defaultLocale, locales, type Locale } from '~/data/locales'
import { useLanguageChoice } from '~/composables/useLanguageChoice'

export type { Locale }

/**
 * Gives a component the language being read, the list of languages the site
 * has, and a way to switch.
 *
 * @returns `locale`, the current language code; `locales`, every language of
 *   the site; `setLocale`, which shows the current page in another language
 *   and saves the choice; and `t`, the translation function
 */
export function useLocale() {
  const { locale, t, setLocale } = useI18n()
  const { choose } = useLanguageChoice()

  const currentLocale = computed<Locale>(
    () => locales.find(({ code }) => code === locale.value)?.code ?? defaultLocale
  )

  return {
    locale: currentLocale,
    locales,
    setLocale: (newLocale: Locale) => {
      choose(newLocale)
      return setLocale(newLocale)
    },
    t,
  }
}
