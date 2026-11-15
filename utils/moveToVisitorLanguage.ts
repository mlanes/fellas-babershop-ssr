/** What `moveToVisitorLanguage` needs to know about the site's languages. */
export interface VisitorLanguageSettings {
  /** The code of every language the site has, e.g. `['pt', 'en']` */
  codes: string[]
  /** The language of the plain home address */
  defaultLocale: string
  /** The language for a browser that asks for none of `codes` */
  fallbackLocale: string
  /** The name of the cookie holding the language picked in the selector */
  cookie: string
}

/**
 * Takes a visitor who opens the plain home address to their language: the one
 * they picked in the selector, else the first of their browser's languages the
 * site has, else the fallback. Whatever followed the address is kept. Every
 * other address is left as it is, and so are search-engine crawlers, which
 * must find the default language here.
 *
 * It is written into the head of every page as text and runs there before
 * anything is drawn, so it may use nothing from outside its own body.
 *
 * @param settings - the site's languages and the name of the choice cookie
 */
export function moveToVisitorLanguage(settings: VisitorLanguageSettings): void {
  if (window.location.pathname !== '/') return

  // Cubot is a phone maker; its user agent contains "bot". The crawlers that
  // run scripts report an English browser, so without this check they would
  // be moved too.
  const userAgent = navigator.userAgent
  if (
    !/cubot/i.test(userAgent) &&
    /bot|crawl|spider|slurp|google-inspectiontool|googleother|yeti/i.test(userAgent)
  ) {
    return
  }

  const picked = document.cookie
    .split('; ')
    .map((pair) => pair.split('='))
    .filter((pair) => pair[0] === settings.cookie)
    .map((pair) => pair[1])
    .find((code) => settings.codes.includes(code))

  // Some in-app browsers report an empty list.
  const asked = (navigator.languages.length ? navigator.languages : [navigator.language])
    .map((tag) => tag.toLowerCase().split('-')[0])
    .find((code) => settings.codes.includes(code))

  const wanted = picked ?? asked ?? settings.fallbackLocale
  if (wanted === settings.defaultLocale) return

  // replace, so Back leaves the site and does not return to this address.
  window.location.replace(`/${wanted}/${window.location.search}${window.location.hash}`)
}
