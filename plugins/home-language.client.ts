import { defaultLocale, fallbackLocale, matchLocale } from '~/data/locales'
import { useLanguageChoice } from '~/composables/useLanguageChoice'

// Search engines must find Portuguese on the plain home address, and the one
// that runs scripts reports an English browser.
const isCrawler = (userAgent: string) => /bot|crawl|spider|slurp/i.test(userAgent)

/**
 * Takes a visitor who opens the plain home address to their language: the one
 * they picked in the selector, else the first of their browser's languages the
 * site has, else the fallback. Every other address is left as it is, and so
 * are search-engine crawlers.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { chosen } = useLanguageChoice()

  nuxtApp.hook('app:mounted', async () => {
    if (window.location.pathname !== '/' || isCrawler(navigator.userAgent)) return

    const browserLanguages = navigator.languages ?? [navigator.language]
    const wanted = chosen.value ?? matchLocale(browserLanguages) ?? fallbackLocale
    if (wanted === defaultLocale) return

    await nuxtApp.runWithContext(() => useNuxtApp().$i18n.setLocale(wanted))
  })
})
