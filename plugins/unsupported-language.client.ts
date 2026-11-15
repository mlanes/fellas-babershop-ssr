import { fallbackLocale, locales } from '~/data/locales'
import { useLanguageChoice } from '~/composables/useLanguageChoice'

/**
 * Shows the site in the fallback language to a visitor who arrives on the plain
 * home address with a browser that asks for none of the site's languages. A
 * visitor who has picked a language in the selector, or who arrives on any
 * other address, is left where they are.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { wasChosen } = useLanguageChoice()

  nuxtApp.hook('app:mounted', async () => {
    if (window.location.pathname !== '/' || wasChosen()) return

    const asked = navigator.languages.map((tag) => tag.toLowerCase().split('-')[0])
    if (asked.some((code) => locales.some((locale) => locale.code === code))) return

    await nuxtApp.runWithContext(() => useNuxtApp().$i18n.setLocale(fallbackLocale))
  })
})
