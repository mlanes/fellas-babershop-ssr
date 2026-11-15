import { defaultLocale, fallbackLocale, localizedPath, matchLocale } from '~/data/locales'
import { useLanguageChoice } from '~/composables/useLanguageChoice'

/**
 * Tells whether a visitor is a search-engine crawler, judged by the name it
 * gives itself.
 *
 * @param userAgent - the browser's user-agent string
 * @example isCrawler('Mozilla/5.0 (compatible; Googlebot/2.1)') // true
 */
function isCrawler(userAgent: string): boolean {
  // Cubot is a phone maker; its user agent contains "bot".
  if (/cubot/i.test(userAgent)) return false
  return /bot|crawl|spider|slurp|google-inspectiontool|googleother|yeti/i.test(userAgent)
}

/**
 * Takes a visitor who opens the plain home address to their language: the one
 * they picked in the selector, else the first of their browser's languages the
 * site has, else the fallback. Every other address is left as it is. So are
 * search-engine crawlers, which must find Portuguese here and of which the
 * ones that run scripts report an English browser.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { chosen } = useLanguageChoice()

  nuxtApp.hook('app:mounted', async () => {
    if (window.location.pathname !== '/' || isCrawler(navigator.userAgent)) return

    // Some in-app browsers report an empty list.
    const browserLanguages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
    const wanted = chosen.value ?? matchLocale(browserLanguages) ?? fallbackLocale
    if (wanted === defaultLocale) return

    // Replaces the entry in the history, so Back leaves the site as the
    // visitor expects and does not land on the page they were moved from.
    await nuxtApp.runWithContext(() => navigateTo(localizedPath('/', wanted), { replace: true }))
  })
})
