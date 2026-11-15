<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppLoader from '~/components/ui/AppLoader.vue'
import { useStructuredData } from '~/composables/useStructuredData'

const { t } = useI18n()

// The page's language, its address for search engines and the links to the
// same page in the other languages all come from the i18n module.
const localeHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: localeHead.value.meta,
}))

// One title and one description per language, for the browser tab, search
// results and shared links alike. A page with its own title sets it itself.
useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  twitterTitle: () => t('seo.title'),
  twitterDescription: () => t('seo.description'),
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
