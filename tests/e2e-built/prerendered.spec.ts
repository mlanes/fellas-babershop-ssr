import { existsSync } from 'node:fs'
import { expect, test, type APIRequestContext } from '@playwright/test'
import { localeCookie, locales, localizedPath } from '../../data/locales'

const siteAddress = 'https://fellasbarber.com'
const pages = ['/', '/services', '/gallery', '/contacts', '/score']
const comingSoonPages = ['/services', '/gallery', '/contacts', '/score']
const languages = [
  { prefix: '', lang: 'pt-PT' },
  { prefix: '/en', lang: 'en-US' },
  { prefix: '/es', lang: 'es-ES' },
  { prefix: '/fr', lang: 'fr-FR' },
]

/**
 * Fetches a page as it was built: what a browser or a search engine is sent
 * before any script runs.
 *
 * @throws if the page does not answer 200
 */
async function builtHtml(
  request: APIRequestContext,
  path: string,
  headers: Record<string, string> = {}
): Promise<string> {
  const response = await request.get(path, { headers, maxRedirects: 0 })
  if (response.status() !== 200) throw new Error(`${path} answered ${response.status()}`)
  return await response.text()
}

/** Reads a meta tag's text from a page's HTML, by its `name` or `property`. */
function metaContent(html: string, name: string): string | undefined {
  const content = new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`).exec(html)?.[1]
  return content?.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&')
}

const langOf = (html: string) => /<html[^>]*\blang="([^"]*)"/.exec(html)?.[1]
const pathOf = (prefix: string, page: string) => (page === '/' ? prefix || '/' : `${prefix}${page}`)
// Every address but the Portuguese home page's ends in a slash, as Netlify serves it.
const addressOf = (prefix: string, page: string) => {
  const path = page === '/' ? prefix : `${prefix}${page}`
  return path === '' ? siteAddress : `${siteAddress}${path}/`
}

test.describe('The built pages', () => {
  // The build once wrote this page as a bare redirect to the English one.
  test('the plain home address is Portuguese whatever the request asks for', async ({
    request,
  }) => {
    const html = await builtHtml(request, '/', {
      'Accept-Language': 'en-US,en;q=0.9',
      Cookie: `${localeCookie}=fr`,
    })

    expect(langOf(html)).toBe('pt-PT')
    expect(html).not.toContain('http-equiv="refresh"')
    expect(html).toContain('<main')
  })

  for (const { prefix, lang } of languages) {
    for (const page of pages) {
      const path = pathOf(prefix, page)

      test(`${path} is built in ${lang} and names itself as the address to index`, async ({
        request,
      }) => {
        const html = await builtHtml(request, path)

        expect(langOf(html)).toBe(lang)
        expect(html).toContain(`rel="canonical" href="${addressOf(prefix, page)}"`)
      })
    }

    for (const page of comingSoonPages) {
      test(`${prefix}${page} asks search engines not to list it`, async ({ request }) => {
        const html = await builtHtml(request, `${prefix}${page}`)

        expect(html).toContain('<meta name="robots" content="noindex, follow">')
      })
    }
  }

  test('a page names its sister pages before any script runs', async ({ request }) => {
    const html = await builtHtml(request, '/en')

    for (const { prefix, lang } of languages) {
      expect(html).toContain(`href="${addressOf(prefix, '/')}" hreflang="${lang}"`)
    }
    expect(html).toContain(`href="${siteAddress}" hreflang="x-default"`)
  })
})

test('the sitemap lists the four home pages and nothing else', async ({ request }) => {
  const sitemap = await builtHtml(request, '/sitemap.xml')
  const listed = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1])

  expect(listed.sort()).toEqual([
    `${siteAddress}/`,
    `${siteAddress}/en/`,
    `${siteAddress}/es/`,
    `${siteAddress}/fr/`,
  ])
})

test('the sitemap gives each home page its sister pages', async ({ request }) => {
  const sitemap = await builtHtml(request, '/sitemap.xml')
  const entries = sitemap.split('<url>').slice(1)

  expect(entries).toHaveLength(4)
  for (const entry of entries) {
    for (const sister of [
      `href="${siteAddress}/" hreflang="x-default"`,
      `href="${siteAddress}/" hreflang="pt-PT"`,
      `href="${siteAddress}/en/" hreflang="en-US"`,
      `href="${siteAddress}/es/" hreflang="es-ES"`,
      `href="${siteAddress}/fr/" hreflang="fr-FR"`,
    ]) {
      expect(entry).toContain(sister)
    }
  }
})

test.describe('What a search result and a shared link show, before any script runs', () => {
  const homePages = [
    {
      path: '/',
      title: 'Fellas Barbers - A Sua Barbearia de Confiança',
      descriptionStart: 'Fellas Barbers - Barbearia premium em Lisboa.',
    },
    {
      path: '/en',
      title: 'Fellas Barbers - Your Trusted Barbershop in Lisbon',
      descriptionStart: 'Fellas Barbers - Premium barbershop in Lisbon.',
    },
    {
      path: '/es',
      title: 'Fellas Barbers - Tu Barbería de Confianza en Lisboa',
      descriptionStart: 'Fellas Barbers - Barbería premium en Lisboa.',
    },
    {
      path: '/fr',
      title: 'Fellas Barbers - Votre Barbier de Confiance à Lisbonne',
      descriptionStart: 'Fellas Barbers - Barbier haut de gamme à Lisbonne.',
    },
  ]

  for (const { path, title, descriptionStart } of homePages) {
    test(`${path} has one title and one description, in its language`, async ({ request }) => {
      const html = await builtHtml(request, path)

      expect(html).toContain(`<title>${title}</title>`)
      expect(metaContent(html, 'og:title')).toBe(title)
      expect(metaContent(html, 'twitter:title')).toBe(title)

      const description = metaContent(html, 'description')
      expect(description).toContain(descriptionStart)
      expect(metaContent(html, 'og:description')).toBe(description)
      expect(metaContent(html, 'twitter:description')).toBe(description)
    })
  }

  // A page with its own title shows it in the tab and in a shared link alike.
  const comingSoon = [
    { path: '/services', title: 'Serviços — Fellas Barbers' },
    { path: '/fr/services', title: 'Services — Fellas Barbers' },
    { path: '/es/gallery', title: 'Galería — Fellas Barbers' },
    { path: '/en/contacts', title: 'Contacts — Fellas Barbers' },
  ]

  for (const { path, title } of comingSoon) {
    test(`${path} is titled "${title}" everywhere`, async ({ request }) => {
      const html = await builtHtml(request, path)

      expect(html).toContain(`<title>${title}</title>`)
      expect(metaContent(html, 'og:title')).toBe(title)
      expect(metaContent(html, 'twitter:title')).toBe(title)
    })
  }
})

test.describe('The business details given to search engines', () => {
  interface Entry {
    '@type': string
    '@id'?: string
    inLanguage?: string | string[]
    url?: string
    isPartOf?: { '@id': string }
  }

  /** Reads the structured data out of a page's HTML. */
  function entriesOf(html: string): Entry[] {
    const json = /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s.exec(html)?.[1]
    if (!json) throw new Error('no structured data on the page')
    return JSON.parse(json)['@graph']
  }

  const pagesToDescribe = [
    { path: '/', lang: 'pt-PT', address: siteAddress },
    { path: '/en', lang: 'en-US', address: `${siteAddress}/en/` },
    { path: '/es', lang: 'es-ES', address: `${siteAddress}/es/` },
    { path: '/fr/services', lang: 'fr-FR', address: `${siteAddress}/fr/services/` },
  ]

  for (const { path, lang, address } of pagesToDescribe) {
    test(`${path} is described as a page in ${lang} at its own address`, async ({ request }) => {
      const page = entriesOf(await builtHtml(request, path)).find(
        (entry) => entry['@type'] === 'WebPage'
      )

      expect(page?.inLanguage).toBe(lang)
      expect(page?.url).toBe(address)
      expect(page?.isPartOf).toEqual({ '@id': `${siteAddress}/#website` })
    })

    // One site and one set of shops, the same on every page: an entry that
    // changed its address from page to page would read as conflicting facts.
    test(`${path} describes the site and the shops as it does everywhere`, async ({ request }) => {
      const entries = entriesOf(await builtHtml(request, path))
      const website = entries.find((entry) => entry['@type'] === 'WebSite')
      const shops = entries.filter((entry) => entry['@type'] === 'BarberShop')

      expect(website?.url).toBe(siteAddress)
      expect(website?.inLanguage).toEqual(['pt-PT', 'en-US', 'es-ES', 'fr-FR'])
      expect(shops.length).toBeGreaterThan(0)
      for (const shop of shops) expect(shop.url).toBe(siteAddress)
    })
  }
})

test.describe('The language list', () => {
  for (const { code, language } of locales) {
    test(`${code} has a translation file and a built home page in ${language}`, async ({
      request,
    }) => {
      expect(existsSync(`i18n/locales/${code}.json`)).toBe(true)

      const html = await builtHtml(request, localizedPath('/', code))
      expect(langOf(html)).toBe(language)
    })

    test(`${code} has its home page in the sitemap`, async ({ request }) => {
      const sitemap = await builtHtml(request, '/sitemap.xml')

      const home = localizedPath('/', code)
      expect(sitemap).toContain(`<loc>${siteAddress}${home === '/' ? home : `${home}/`}</loc>`)
    })
  }
})
