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

const langOf = (html: string) => /<html[^>]*\blang="([^"]*)"/.exec(html)?.[1]
const pathOf = (prefix: string, page: string) => (page === '/' ? prefix || '/' : `${prefix}${page}`)
const addressOf = (prefix: string, page: string) =>
  `${siteAddress}${page === '/' ? prefix : `${prefix}${page}`}`

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
    `${siteAddress}/en`,
    `${siteAddress}/es`,
    `${siteAddress}/fr`,
  ])
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

      expect(sitemap).toContain(`<loc>${siteAddress}${localizedPath('/', code)}</loc>`)
    })
  }
})
