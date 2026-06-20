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

  runtimeConfig: {
    public: {
      siteUrl: 'https://fellasbarber.com',
    },
  },

  sitemap: {
    // Coming-soon routes are noindex placeholders — keep them out of the sitemap.
    exclude: ['/services', '/gallery', '/contacts', '/score'],
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
      title: 'Fellas Barbers - A Sua Barbearia de Confiança',
      meta: [
        { name: 'theme-color', content: '#e63946' },
        {
          name: 'description',
          content:
            'Fellas Barbers - Barbearia premium em Lisboa. Cortes de cabelo masculinos, barba, styling e grooming profissional. Ambiente moderno e serviço de excelência. Agende já!',
        },
        {
          name: 'keywords',
          content:
            "barbearia lisboa, barbeiro lisboa, corte masculino lisboa, barba lisboa, barbearia premium portugal, fellas barbers, grooming masculino, fade haircut, undercut, beard trim, barbearia tradicional, men's grooming lisboa, hair styling lisboa, aparar barba, corte degradê",
        },
        // Open Graph
        { property: 'og:site_name', content: 'Fellas Barbers' },
        { property: 'og:title', content: 'Fellas Barbers - A Sua Barbearia de Confiança' },
        {
          property: 'og:description',
          content: 'Serviços profissionais de barbeiro com qualidade premium em Lisboa, Portugal.',
        },
        { property: 'og:image', content: 'https://fellasbarber.com/og-image.jpg' },
        { property: 'og:type', content: 'website' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Fellas Barbers' },
        {
          name: 'twitter:description',
          content: 'A sua barbearia de confiança em Lisboa, Portugal.',
        },
        { name: 'twitter:image', content: 'https://fellasbarber.com/og-image.jpg' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      ],
      style: [
        {
          // Inline loader styles - renders immediately before any JS
          innerHTML: `
            #__nuxt-loader {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: var(--page-background, #0A0909);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              transition: opacity 0.3s ease;
            }
            #__nuxt-loader.fade-out {
              opacity: 0;
              pointer-events: none;
            }
            #__nuxt-loader-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 32px;
            }
            #__nuxt-loader-progress {
              width: 200px;
              height: 2px;
              background-color: rgba(10, 9, 9, 0.2);
              border-radius: 9999px;
              overflow: hidden;
            }
            #__nuxt-loader-bar {
              height: 100%;
              width: 0%;
              background: linear-gradient(90deg, #e63946 0%, #8b0000 100%);
              border-radius: 9999px;
              animation: loader-progress 2s ease-out forwards;
            }
            @keyframes loader-progress {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 90%; }
            }
          `,
        },
      ],
      script: [
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

  routeRules: {
    '/': { prerender: true },
    '/services': { prerender: true },
    '/gallery': { prerender: true },
    '/contacts': { prerender: true },
    '/score': { prerender: true },
  },

  i18n: {
    locales: [
      { code: 'pt', file: 'pt.json', name: 'Português' },
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'es', file: 'es.json', name: 'Español' },
      { code: 'fr', file: 'fr.json', name: 'Français' },
    ],
    defaultLocale: 'pt',
    lazy: true,
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
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
      runtimeCaching: [
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
