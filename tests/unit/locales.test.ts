import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { defaultLocale, localizedPath, locales } from '../../data/locales'
import { services } from '../../data/services'

describe('The address of a page in a language', () => {
  it.each([
    { page: '/', locale: 'pt', address: '/' },
    { page: '/services', locale: 'pt', address: '/services' },
    { page: '/', locale: 'en', address: '/en' },
    { page: '/', locale: 'fr', address: '/fr' },
    { page: '/services', locale: 'es', address: '/es/services' },
    { page: '/contacts', locale: 'fr', address: '/fr/contacts' },
  ] as const)('$page in $locale is $address', ({ page, locale, address }) => {
    expect(localizedPath(page, locale)).toBe(address)
  })
})

/**
 * Reads a language's translation file and lists every text in it by its full
 * key, e.g. `a11y.rating`.
 *
 * @throws if the file is missing or is not a JSON object
 */
function textsOf(code: string): Map<string, string> {
  const file = fileURLToPath(new URL(`../../i18n/locales/${code}.json`, import.meta.url))
  const texts = new Map<string, string>()
  collect(JSON.parse(readFileSync(file, 'utf8')), '', texts)
  return texts
}

function collect(value: unknown, key: string, into: Map<string, string>): void {
  if (typeof value === 'string') {
    into.set(key, value)
    return
  }
  if (typeof value !== 'object' || value === null) {
    throw new Error(`${key || 'the file'} is neither a text nor a group of texts`)
  }
  for (const [name, inner] of Object.entries(value)) {
    // vue-i18n reads a dot as a step into a group, so it never finds a name
    // written with one, though joined up it would look the same as a nested key.
    if (name.includes('.')) throw new Error(`"${name}" under ${key || 'the top'} has a dot in it`)
    collect(inner, key ? `${key}.${name}` : name, into)
  }
}

/** The names a text leaves to be filled in, e.g. `{shop}` and `{n}`. */
function placeholdersIn(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').sort()
}

/**
 * Lists the translation keys the site's code asks for by name, as in
 * `t('a11y.close')`. Keys built while the site runs are not found.
 */
function keysTheCodeAsksFor(): string[] {
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const sources = ['components', 'composables', 'pages']
    .flatMap((folder) =>
      readdirSync(`${root}${folder}`, { recursive: true, encoding: 'utf8' }).map(
        (file) => `${folder}/${file}`
      )
    )
    .filter((file) => /\.(vue|ts)$/.test(file))
    .concat('app.vue')
  const keys = sources.flatMap((file) =>
    [...readFileSync(`${root}${file}`, 'utf8').matchAll(/\bt\(\s*'([\w.-]+)'/g)].map(
      (match) => match[1] ?? ''
    )
  )
  return [...new Set(keys)].sort()
}

// Portuguese service texts are in the service list itself (data/services.ts);
// only the other languages keep them in their translation file.
const serviceTexts = 'servicesList.'

describe('The translation files', () => {
  const reference = textsOf(defaultLocale)
  const others = locales.map((locale) => locale.code).filter((code) => code !== defaultLocale)

  it('are compared with a Portuguese file that has texts in it', () => {
    expect(reference.size).toBeGreaterThan(0)
    expect(others).toHaveLength(locales.length - 1)
  })

  // A key missing from one language shows on the page as the key itself.
  it.each(others)('%s has exactly the keys Portuguese has, service texts aside', (code) => {
    const keys = [...textsOf(code).keys()].filter((key) => !key.startsWith(serviceTexts))
    expect(keys.sort()).toEqual([...reference.keys()].sort())
  })

  it.each([defaultLocale, ...others])('%s has no empty text', (code) => {
    const empty = [...textsOf(code)].filter(([, text]) => text.trim() === '').map(([key]) => key)
    expect(empty).toEqual([])
  })

  // A text that drops `{shop}` reads without the shop's name; one that
  // renames it shows the braces to the visitor.
  it.each(others)('%s leaves the same gaps to fill as Portuguese, text by text', (code) => {
    const texts = textsOf(code)
    const different = [...reference]
      .filter(([key]) => texts.has(key))
      .filter(
        ([key, text]) => placeholdersIn(texts.get(key) ?? '').join() !== placeholdersIn(text).join()
      )
      .map(([key]) => key)
    expect(different).toEqual([])
  })

  // "@" starts a link to another text and "|" separates plural forms, so an
  // Instagram handle or an email address written plainly is misread.
  it.each([defaultLocale, ...others])('%s has no text vue-i18n would read as syntax', (code) => {
    const misread = [...textsOf(code)]
      .filter(([, text]) => /[@|]/.test(text.replaceAll(/\{'[^']*'\}/g, '')))
      .map(([key]) => key)
    expect(misread).toEqual([])
  })

  // A key that is in no file is shown to the visitor as the key itself.
  it('have every text the code asks for by name', () => {
    const asked = keysTheCodeAsksFor()
    expect(asked.length).toBeGreaterThan(50)
    expect(asked.filter((key) => !reference.has(key))).toEqual([])
  })

  // A service with a translation missing is not an error on the page: it is
  // shown in Portuguese, on the English, Spanish or French site, and nothing
  // says so.
  it.each(others)('%s translates the name and both descriptions of every service', (code) => {
    const texts = textsOf(code)
    const wanted = services.flatMap((service) => [
      `${serviceTexts}${service.id}.name`,
      `${serviceTexts}${service.id}.description`,
      ...(service.detailedDescription ? [`${serviceTexts}${service.id}.detailedDescription`] : []),
    ])
    expect(wanted.length).toBeGreaterThan(0)
    expect(wanted.filter((key) => !texts.has(key))).toEqual([])
  })
})
