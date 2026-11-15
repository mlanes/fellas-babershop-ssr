<script setup lang="ts">
import ComingSoon from '~/components/sections/ComingSoon.vue'
import { useLocale } from '~/composables/useLocale'
import { usePageTitle } from '~/composables/usePageTitle'

const { t } = useLocale()
const title = computed(() => t('comingSoon.pages.contacts'))

usePageTitle(() => `${title.value} — Fellas Barbers`)
useSeoMeta({ robots: 'noindex, follow' })
</script>

<template>
  <ComingSoon :title="title" />
</template>
