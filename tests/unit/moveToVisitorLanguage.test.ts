import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultLocale, fallbackLocale, localeCookie, locales } from '../../data/locales'
import { moveToVisitorLanguage } from '../../utils/moveToVisitorLanguage'

const settings = {
  codes: locales.map((locale) => locale.code),
  defaultLocale,
  fallbackLocale,
  cookie: localeCookie,
}

const phone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1'

interface Visit {
  /** The address opened, e.g. `/` or `/services?x=1#top` */
  address: string
  /** The browser's languages, most wanted first */
  browser: string[]
  /** The browser's single language, used when the list is empty */
  browserLanguage?: string
  /** The cookies the browser sends, as it writes them */
  cookies?: string
  userAgent?: string
}

/**
 * Opens an address as a visitor's browser would and reports where the visitor
 * was taken. The browser is the one thing here that is not the site's own.
 *
 * @returns the address moved to, or `null` when the visitor stays
 */
function open(visit: Visit): string | null {
  const url = new URL(visit.address, 'https://fellasbarber.com')
  const replace = vi.fn<(address: string) => void>()
  vi.stubGlobal('window', {
    location: { pathname: url.pathname, search: url.search, hash: url.hash, replace },
  })
  vi.stubGlobal('navigator', {
    userAgent: visit.userAgent ?? phone,
    languages: visit.browser,
    language: visit.browserLanguage ?? visit.browser[0] ?? '',
  })
  vi.stubGlobal('document', { cookie: visit.cookies ?? '' })

  moveToVisitorLanguage(settings)

  return replace.mock.calls[0]?.[0] ?? null
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('A visitor who opens the plain home address', () => {
  it.each([
    { browser: ['en-GB', 'en'], lands: '/en/' },
    { browser: ['es-ES'], lands: '/es/' },
    { browser: ['fr'], lands: '/fr/' },
    { browser: ['FR-fr'], lands: '/fr/' },
  ])('with a $browser browser is taken to $lands', ({ browser, lands }) => {
    expect(open({ address: '/', browser })).toBe(lands)
  })

  it.each([{ browser: ['pt-PT', 'pt'] }, { browser: ['pt-BR'] }, { browser: ['pt', 'en'] }])(
    'with a $browser browser stays on the Portuguese page',
    ({ browser }) => {
      expect(open({ address: '/', browser })).toBeNull()
    }
  )

  it('is taken to English when the browser asks for no language the site has', () => {
    expect(open({ address: '/', browser: ['de-DE', 'nl'] })).toBe('/en/')
  })

  it('is taken to the first of the browser languages the site has', () => {
    expect(open({ address: '/', browser: ['de', 'es', 'fr'] })).toBe('/es/')
  })

  // Some in-app browsers report an empty list.
  it('is placed by the single browser language when the list is empty', () => {
    expect(open({ address: '/', browser: [], browserLanguage: 'fr-CA' })).toBe('/fr/')
  })

  it('keeps what followed the address', () => {
    expect(open({ address: '/?utm_source=instagram#services', browser: ['en'] })).toBe(
      '/en/?utm_source=instagram#services'
    )
  })
})

describe('A visitor who picked a language in the selector', () => {
  it('is taken to it, whatever the browser asks for', () => {
    expect(open({ address: '/', browser: ['en'], cookies: `${localeCookie}=fr` })).toBe('/fr/')
  })

  it('stays on the Portuguese page after picking Portuguese in an English browser', () => {
    expect(open({ address: '/', browser: ['en'], cookies: `${localeCookie}=pt` })).toBeNull()
  })

  it('is found among other cookies', () => {
    const cookies = `theme=dark; ${localeCookie}=es; other=1`
    expect(open({ address: '/', browser: ['en'], cookies })).toBe('/es/')
  })

  it('is placed by the browser when the saved pick is not a language the site has', () => {
    expect(open({ address: '/', browser: ['es'], cookies: `${localeCookie}=de` })).toBe('/es/')
  })

  // The site once saved the language last shown under this name; it is not a pick.
  it('is not placed by the cookie the site used before', () => {
    expect(open({ address: '/', browser: ['pt'], cookies: 'i18n_redirected=fr' })).toBeNull()
  })
})

describe('An address that is not the plain home address', () => {
  it.each(['/services', '/en/', '/fr/services/', '/contacts'])('%s is left as it is', (address) => {
    const cookies = `${localeCookie}=es`
    expect(open({ address, browser: ['en'], cookies })).toBeNull()
  })
})

describe('Search engines, which must find Portuguese on the plain home address', () => {
  it.each([
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)',
    'Mozilla/5.0 (compatible; GoogleOther)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
    'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)',
    'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  ])('%s is not moved', (userAgent) => {
    expect(open({ address: '/', browser: ['en-US'], userAgent })).toBeNull()
  })

  // Cubot is a phone maker whose user agent contains "bot".
  it('a visitor on a Cubot phone is moved like any other', () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 13; CUBOT KingKong 9) Chrome/120.0 Mobile'
    expect(open({ address: '/', browser: ['en-US'], userAgent })).toBe('/en/')
  })
})
