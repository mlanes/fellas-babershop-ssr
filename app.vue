<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppLoader from '~/components/ui/AppLoader.vue'
import { useStructuredData } from '~/composables/useStructuredData'

const { locale, t } = useI18n()
const route = useRoute()

const SITE_URL = 'https://fellasbarber.com'

const localeToLang: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
}

const canonicalUrl = computed(() => {
  const path = route.path === '/' ? '' : route.path.replace(/\/$/, '')
  return `${SITE_URL}${path}`
})

useHead({
  htmlAttrs: {
    lang: computed(() => localeToLang[locale.value] ?? locale.value),
  },
  link: [
    { rel: 'canonical', href: canonicalUrl },
    // i18n strategy is no_prefix, so all locales share one URL. hreflang
    // tags still tell search engines what languages this URL serves.
    { rel: 'alternate', hreflang: 'pt-PT', href: canonicalUrl },
    { rel: 'alternate', hreflang: 'en-US', href: canonicalUrl },
    { rel: 'alternate', hreflang: 'es-ES', href: canonicalUrl },
    { rel: 'alternate', hreflang: 'fr-FR', href: canonicalUrl },
    { rel: 'alternate', hreflang: 'x-default', href: canonicalUrl },
  ],
  meta: [{ property: 'og:url', content: canonicalUrl }],
})

useStructuredData()
</script>

<template>
  <AppLoader />
  <a href="#main" class="skip-link">{{ t('common.skipToContent') }}</a>
  <div id="app">
    <AppHeader />
    <main id="main">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

#app {
  min-height: 100vh;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  z-index: 10000;
  padding: $spacing-sm $spacing-md;
  background: var(--brand-color-primary);
  color: var(--text-color-inverse, #fff);
  font-weight: 600;
  text-decoration: none;
  border-radius: 0 0 $radius-md 0;

  &:focus {
    top: 0;
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
