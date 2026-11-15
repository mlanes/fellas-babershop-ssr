import { defaultLocale, fallbackLocale, localeCookie, locales, localizedPath } from './data/locales'
import { moveToVisitorLanguage, type VisitorLanguageSettings } from './utils/moveToVisitorLanguage'

const siteUrl = 'https://fellasbarber.com'

// A page added under pages/ goes in one of these two lists, or it is not built.
const comingSoonPages = ['/services', '/gallery', '/contacts', '/score']
const pages = ['/', ...comingSoonPages]

const inEveryLanguage = (paths: string[]) =>
  paths.flatMap((path) => locales.map(({ code }) => localizedPath(path, code)))

const visitorLanguageSettings: VisitorLanguageSettings = {
  codes: locales.map(({ code }) => code),
  defaultLocale,
  fallbackLocale,
  cookie: localeCookie,
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Nitro auto-detects the deployment target: 'netlify' when the
  // NETLIFY env var is present (during Netlify builds), 'node-server'
  // when building anywhere else (Coolify, local). Keeps the repo
  // portable between hosts without env-var juggling.

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    'nuxt-svgo',
    '@nuxt/image',
    '@nuxtjs/sitemap',
  ],

  site: {
    url: siteUrl,
    // Netlify serves every page at an address ending in a slash and redirects
    // the form without one, so the addresses given to search engines end in
    // one too. The i18n module has the same setting below.
    trailingSlash: true,
  },

  sitemap: {
    // Coming-soon routes are noindex placeholders — keep them out of the sitemap.
    exclude: inEveryLanguage(comingSoonPages),
    // One sitemap at /sitemap.xml, which robots.txt names. Otherwise the module
    // splits it into one per language behind an index at another address.
    sitemaps: false,
  },

  image: {
    format: ['webp', 'avif', 'jpeg', 'png'],
    quality: 80,
    densities: [1, 2],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  svgo: {
    autoImportPath: false,
    defaultImport: 'component',
  },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#e63946' },
        {
          name: 'keywords',
          content:
            "barbearia lisboa, barbeiro lisboa, corte masculino lisboa, barba lisboa, barbearia premium portugal, fellas barbers, grooming masculino, fade haircut, undercut, beard trim, barbearia tradicional, men's grooming lisboa, hair styling lisboa, aparar barba, corte degradê",
        },
        // Open Graph
        { property: 'og:site_name', content: 'Fellas Barbers' },
        { property: 'og:image', content: `${siteUrl}/og-image.jpg` },
        { property: 'og:type', content: 'website' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${siteUrl}/og-image.jpg` },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      ],
      script: [
        {
          // First in the head: a visitor who belongs on another language's
          // home page is sent there before anything of this one is drawn.
          innerHTML: `(${moveToVisitorLanguage.toString()})(${JSON.stringify(visitorLanguageSettings)})`,
        },
        {
          innerHTML: `
            const THEME_STORAGE_KEY = 'fellas-theme-preference';
            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            const htmlElement = document.documentElement;
            if (storedTheme === 'auto' || !storedTheme) {
              htmlElement.removeAttribute('data-theme');
            } else if (storedTheme === 'dark' || storedTheme === 'light') {
              htmlElement.setAttribute('data-theme', storedTheme);
            }
          `,
        },
      ],
    },
  },

  routeRules: Object.fromEntries(inEveryLanguage(pages).map((path) => [path, { prerender: true }])),

  i18n: {
    locales: locales.map(({ code, language, name }) => ({
      code,
      language,
      name,
      file: `${code}.json`,
    })),
    defaultLocale,
    langDir: 'locales',
    strategy: 'prefix_except_default',
    baseUrl: siteUrl,
    trailingSlash: true,
    // The module would decide the language while the pages are prerendered,
    // with no visitor to ask, and freeze its answer into `/`. It also saves the
    // language last shown as if it had been picked. The visitor's language is
    // settled in the browser by utils/moveToVisitorLanguage.ts.
    detectBrowserLanguage: false,
  },

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: [
      'favicon.svg',
      'apple-touch-icon.png',
      'favicon-32x32.png',
      'favicon-16x16.png',
    ],
    manifest: {
      name: 'Fellas Barbers',
      short_name: 'Fellas',
      description:
        'Barbearia premium em Lisboa. Cortes de cabelo masculinos, barba, styling e grooming profissional.',
      theme_color: '#e63946',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
      globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
      // Every address has its own prerendered page, in its own language. By
      // default the worker answers each page request with its copy of the home
      // page, and the app then keeps that copy's language at another address.
      navigateFallback: null,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            expiration: {
              maxEntries: 40,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          // The translations a page loads when the app starts.
          urlPattern: /\/_i18n\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'translations-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: /\.(?:woff|woff2)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: /\.(?:mp4|webm)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'videos-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
            rangeRequests: true,
          },
        },
      ],
    },
  },

  compatibilityDate: '2025-01-01',
})
