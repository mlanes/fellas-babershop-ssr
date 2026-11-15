import { expect, test, type Page } from '@playwright/test'
import { gotoAndReady, localeCookie, pageHydrated } from './helpers'

const siteAddress = 'https://fellasbarber.com'

/**
 * Where the plain home address leads. A saved choice comes first, then the
 * browser's language, then English for a language the site does not have.
 * `saved` is what the visitor last picked in the selector, if anything.
 */
const homeAddressRules = [
  { browser: 'pt-PT', saved: undefined, path: '/', lang: 'pt-PT', homeLabel: 'Início' },
  { browser: 'pt-BR', saved: undefined, path: '/', lang: 'pt-PT', homeLabel: 'Início' },
  { browser: 'en-US', saved: undefined, path: '/en', lang: 'en-US', homeLabel: 'Home' },
  { browser: 'es-ES', saved: undefined, path: '/es', lang: 'es-ES', homeLabel: 'Inicio' },
  { browser: 'fr-FR', saved: undefined, path: '/fr', lang: 'fr-FR', homeLabel: 'Accueil' },
  { browser: 'de-DE', saved: undefined, path: '/en', lang: 'en-US', homeLabel: 'Home' },
  { browser: 'en-US', saved: 'fr', path: '/fr', lang: 'fr-FR', homeLabel: 'Accueil' },
  { browser: 'en-US', saved: 'pt', path: '/', lang: 'pt-PT', homeLabel: 'Início' },
  { browser: 'pt-PT', saved: 'es', path: '/es', lang: 'es-ES', homeLabel: 'Inicio' },
]

/**
 * An address that names a language is shown in that language, whatever the
 * browser's language or the saved choice. An address without one is Portuguese.
 */
const namedAddressRules = [
  { browser: 'en-US', saved: 'fr', path: '/es', lang: 'es-ES' },
  { browser: 'en-US', saved: 'fr', path: '/es/services', lang: 'es-ES' },
  { browser: 'pt-PT', saved: undefined, path: '/fr/contacts', lang: 'fr-FR' },
  { browser: 'en-US', saved: undefined, path: '/services', lang: 'pt-PT' },
  { browser: 'en-US', saved: 'fr', path: '/gallery', lang: 'pt-PT' },
]

/** Asserts the address the visitor is on, ignoring a trailing slash. */
async function expectAddress(page: Page, path: string, hash = '') {
  const trimmed = (value: string) => value.replace(/\/$/, '')
  await expect(page).toHaveURL(
    (url) => trimmed(url.pathname) === trimmed(path) && url.hash === hash,
    { timeout: 15_000 }
  )
}

async function expectLanguage(page: Page, lang: string) {
  await expect(page.locator('html')).toHaveAttribute('lang', lang, { timeout: 15_000 })
}

async function pickLanguage(page: Page, label: string) {
  await pageHydrated(page)
  await page.locator('.language-selector__button:visible').click()
  await page
    .locator('.language-selector__dropdown:visible .language-selector__option', { hasText: label })
    .click()
}

/** Clicks an item of the main menu, opening the menu first where it is collapsed. */
async function clickMenuItem(page: Page, label: string) {
  await pageHydrated(page)
  const menuToggle = page.locator('button.header__mobile-toggle')
  if (await menuToggle.isVisible()) {
    await menuToggle.click()
    await page.locator('.header__mobile-nav-link', { hasText: label }).click()
  } else {
    await page.locator('.header__nav-link', { hasText: label }).click()
  }
}

test.describe('The plain home address', () => {
  for (const { browser, saved, path, lang, homeLabel } of homeAddressRules) {
    test.describe(`${browser} browser, ${saved ? `saved choice ${saved}` : 'nothing saved'}`, () => {
      test.use({ locale: browser })

      test(`leads to ${path} in ${lang}`, async ({ page, context, baseURL }) => {
        if (!baseURL) throw new Error('baseURL is not configured')
        if (saved) await context.addCookies([{ name: localeCookie, value: saved, url: baseURL }])
        await gotoAndReady(page, '/')

        await expectAddress(page, path)
        await expectLanguage(page, lang)
        await expect(page.locator('.footer__link').first()).toHaveText(homeLabel)

        // A late second move would show here.
        await pageHydrated(page)
        await page.waitForTimeout(1000)
        await expectAddress(page, path)
      })
    })
  }
})

test.describe('An address that names a language', () => {
  for (const { browser, saved, path, lang } of namedAddressRules) {
    test.describe(`${browser} browser, ${saved ? `saved choice ${saved}` : 'nothing saved'}`, () => {
      test.use({ locale: browser })

      test(`${path} stays put and is shown in ${lang}`, async ({ page, context, baseURL }) => {
        if (!baseURL) throw new Error('baseURL is not configured')
        if (saved) await context.addCookies([{ name: localeCookie, value: saved, url: baseURL }])
        const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
        expect(response?.status()).toBe(200)

        await pageHydrated(page)
        await page.waitForTimeout(1000)
        await expectAddress(page, path)
        await expectLanguage(page, lang)
      })
    })
  }
})

test.describe('Only a language picked in the selector counts as a choice', () => {
  test.describe('Portuguese browser', () => {
    test.use({ locale: 'pt-PT' })

    test('opening an English link once does not make English the choice', async ({ page }) => {
      await gotoAndReady(page, '/en')
      await expectLanguage(page, 'en-US')
      await pageHydrated(page)

      await gotoAndReady(page, '/')
      await pageHydrated(page)
      await page.waitForTimeout(1000)
      await expectAddress(page, '/')
      await expectLanguage(page, 'pt-PT')
    })
  })

  test.describe('English browser', () => {
    test.use({ locale: 'en-US' })

    test('arriving on a Portuguese page first does not make Portuguese the choice', async ({
      page,
    }) => {
      await gotoAndReady(page, '/services')
      await expectLanguage(page, 'pt-PT')
      await pageHydrated(page)

      await gotoAndReady(page, '/')
      await expectAddress(page, '/en')
      await expectLanguage(page, 'en-US')
    })

    test('a picked language holds after opening a link in another one', async ({ page }) => {
      await gotoAndReady(page, '/')
      await expectAddress(page, '/en')
      await pickLanguage(page, 'Français')
      await expectAddress(page, '/fr')

      await gotoAndReady(page, '/es/services')
      await expectLanguage(page, 'es-ES')
      await pageHydrated(page)

      await gotoAndReady(page, '/')
      await expectAddress(page, '/fr')
      await expectLanguage(page, 'fr-FR')
    })
  })
})

/**
 * Search engines must find Portuguese on the plain home address, and the ones
 * that run scripts report an English browser. A visitor's phone must not be
 * mistaken for one. Every row is an English browser with nothing saved.
 */
const userAgentRules = [
  {
    visitor: "Google's crawler",
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    path: '/',
    lang: 'pt-PT',
  },
  {
    visitor: "Google's Search Console inspection tool",
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0;)',
    path: '/',
    lang: 'pt-PT',
  },
  {
    visitor: 'a Cubot phone, whose name contains "bot"',
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; CUBOT KINGKONG 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    path: '/en',
    lang: 'en-US',
  },
]

test.describe('The plain home address, by who is asking', () => {
  for (const { visitor, userAgent, path, lang } of userAgentRules) {
    test.describe(visitor, () => {
      test.use({ locale: 'en-US', userAgent })

      test(`ends on ${path} in ${lang}`, async ({ page }) => {
        await gotoAndReady(page, '/')
        await pageHydrated(page)
        await page.waitForTimeout(1000)

        await expectAddress(page, path)
        await expectLanguage(page, lang)
      })
    })
  }
})

test.describe("The move to the visitor's language", () => {
  test.use({ locale: 'en-US' })

  // On a slow connection the app takes many seconds to start. Measured on
  // fast 3G, a move that waited for it left the Portuguese page on screen for
  // more than four seconds.
  test('does not wait for the app to start', async ({ page }) => {
    await page.route('**/_nuxt/**', (route) => route.abort())
    await page.goto('/', { waitUntil: 'commit' })

    await expectAddress(page, '/en')
    await expectLanguage(page, 'en-US')
  })

  test('keeps what followed the address', async ({ page }) => {
    await gotoAndReady(page, '/?utm_source=flyer#barbershops')

    await expect(page).toHaveURL(/\/en\/\?utm_source=flyer#barbershops$/, { timeout: 15_000 })
  })

  test('leaves no extra step for the Back button', async ({ page }) => {
    await gotoAndReady(page, '/services')
    await pageHydrated(page)

    await gotoAndReady(page, '/')
    await expectAddress(page, '/en')
    await pageHydrated(page)

    await page.goBack()
    await expectAddress(page, '/services')
  })

  // The site used to keep the language last shown in this cookie, so its
  // values are not picks.
  test('ignores the cookie the site used before', async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL is not configured')
    await context.addCookies([{ name: 'i18n_redirected', value: 'pt', url: baseURL }])
    await gotoAndReady(page, '/')

    await expectAddress(page, '/en')
    await expectLanguage(page, 'en-US')
  })
})

test.describe('The language selector', () => {
  test('takes the visitor to the same page in the picked language', async ({ page }) => {
    await gotoAndReady(page, '/')
    await expectLanguage(page, 'pt-PT')

    await pickLanguage(page, 'English')
    await expectAddress(page, '/en')
    await expectLanguage(page, 'en-US')
    await expect(page.locator('.footer__link').first()).toHaveText('Home')
  })

  test('keeps the visitor on the page they were reading', async ({ page }) => {
    await gotoAndReady(page, '/services')

    await pickLanguage(page, 'Français')
    await expectAddress(page, '/fr/services')
    await expectLanguage(page, 'fr-FR')

    await pickLanguage(page, 'Português')
    await expectAddress(page, '/services')
    await expectLanguage(page, 'pt-PT')
  })

  test('is remembered on the next visit to the home address', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('baseURL is not configured')
    await gotoAndReady(page, '/')
    await pickLanguage(page, 'Français')
    await expectAddress(page, '/fr')
    await expect
      .poll(
        async () => (await context.cookies(baseURL)).find((c) => c.name === localeCookie)?.value
      )
      .toBe('fr')

    await gotoAndReady(page, '/')
    await expectAddress(page, '/fr')
    await expectLanguage(page, 'fr-FR')
  })

  // Portuguese is the language of the plain home address, so picking it must
  // hold against both the browser's language and the English fallback.
  for (const browserLanguage of ['en-US', 'de-DE']) {
    test.describe(`${browserLanguage} browser`, () => {
      test.use({ locale: browserLanguage })

      test('remembers Portuguese', async ({ page }) => {
        await gotoAndReady(page, '/')
        await expectAddress(page, '/en')

        await pickLanguage(page, 'Português')
        await expectAddress(page, '/')
        await expectLanguage(page, 'pt-PT')

        await gotoAndReady(page, '/')
        await pageHydrated(page)
        await page.waitForTimeout(1000)
        await expectAddress(page, '/')
        await expectLanguage(page, 'pt-PT')
      })
    })
  }
})

test.describe('Links inside the site keep the language being read', () => {
  test('the coming-soon "back home" link', async ({ page }) => {
    await gotoAndReady(page, '/en/services')
    await pageHydrated(page)
    await page.locator('.coming-soon__back').click()

    await expectAddress(page, '/en')
    await expectLanguage(page, 'en-US')
  })

  test('a menu item, from another page', async ({ page }) => {
    await gotoAndReady(page, '/es/services')
    await clickMenuItem(page, 'Acerca')

    await expectAddress(page, '/es', '#about')
    await expectLanguage(page, 'es-ES')
  })

  test('the logo, from another page', async ({ page }) => {
    await gotoAndReady(page, '/fr/gallery')
    await pageHydrated(page)
    await page.locator('.header__logo').click()

    await expectAddress(page, '/fr', '#home')
    await expectLanguage(page, 'fr-FR')
  })

  test('the booking button, from another page', async ({ page }) => {
    await gotoAndReady(page, '/en/contacts')
    await pageHydrated(page)
    const menuToggle = page.locator('button.header__mobile-toggle')
    if (await menuToggle.isVisible()) await menuToggle.click()
    await page.getByRole('button', { name: 'BOOK NOW' }).click()

    await expectAddress(page, '/en', '#barbershops')
    await expectLanguage(page, 'en-US')
  })

  test.describe('English browser reading a Portuguese page', () => {
    test.use({ locale: 'en-US' })

    test('the logo leads to the Portuguese home page and stays there', async ({ page }) => {
      await gotoAndReady(page, '/services')
      await pageHydrated(page)
      await page.locator('.header__logo').click()

      await expectAddress(page, '/', '#home')
      await page.waitForTimeout(1000)
      await expectAddress(page, '/', '#home')
      await expectLanguage(page, 'pt-PT')
    })
  })

  test('a menu item on the home page itself', async ({ page }) => {
    await gotoAndReady(page, '/en')
    await clickMenuItem(page, 'About')
    await page.waitForTimeout(1000)

    await expectAddress(page, '/en')
    await expectLanguage(page, 'en-US')
  })
})

/**
 * What a search result and a shared link show for the home page: one title
 * and one description per language.
 */
const homePageTexts = [
  {
    path: '/',
    title: 'Fellas Barbers - A Sua Barbearia de Confiança',
    description:
      'Fellas Barbers - Barbearia premium em Lisboa. Cortes de cabelo masculinos, barba, styling e grooming profissional. Ambiente moderno e serviço de excelência. Agende já!',
  },
  {
    path: '/en',
    title: 'Fellas Barbers - Your Trusted Barbershop in Lisbon',
    description:
      "Fellas Barbers - Premium barbershop in Lisbon. Men's haircuts, beard trims, styling and professional grooming. Modern space and excellent service. Book now!",
  },
  {
    path: '/es',
    title: 'Fellas Barbers - Tu Barbería de Confianza en Lisboa',
    description:
      'Fellas Barbers - Barbería premium en Lisboa. Cortes de pelo para hombre, barba, styling y grooming profesional. Ambiente moderno y servicio de excelencia. ¡Reserva ya!',
  },
  {
    path: '/fr',
    title: 'Fellas Barbers - Votre Barbier de Confiance à Lisbonne',
    description:
      "Fellas Barbers - Barbier haut de gamme à Lisbonne. Coupes homme, barbe, coiffage et soins professionnels. Cadre moderne et service d'excellence. Réservez maintenant !",
  },
]

test.describe('The home page is titled and described in its own language', () => {
  for (const { path, title, description } of homePageTexts) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      await expect(page).toHaveTitle(title)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description)
      // A shared link shows the same title and description.
      for (const name of ['og:title', 'twitter:title']) {
        await expect(
          page.locator(`meta[property="${name}"], meta[name="${name}"]`)
        ).toHaveAttribute('content', title)
      }
      for (const name of ['og:description', 'twitter:description']) {
        await expect(
          page.locator(`meta[property="${name}"], meta[name="${name}"]`)
        ).toHaveAttribute('content', description)
      }
    })
  }
})

test.describe('Each page names its sister pages for search engines', () => {
  const pages = [
    { path: '/', sisters: { 'pt-PT': '/', 'en-US': '/en', 'es-ES': '/es', 'fr-FR': '/fr' } },
    { path: '/en', sisters: { 'pt-PT': '/', 'en-US': '/en', 'es-ES': '/es', 'fr-FR': '/fr' } },
    {
      path: '/es/services',
      sisters: {
        'pt-PT': '/services',
        'en-US': '/en/services',
        'es-ES': '/es/services',
        'fr-FR': '/fr/services',
      },
    },
  ]
  // Every address but the home page's ends in a slash, as Netlify serves it.
  const address = (path: string) => (path === '/' ? siteAddress : `${siteAddress}${path}/`)

  for (const { path, sisters } of pages) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      for (const [lang, sisterPath] of Object.entries(sisters)) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute(
          'href',
          address(sisterPath)
        )
      }
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
        'href',
        address(sisters['pt-PT'])
      )
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', address(path))
    })
  }
})
