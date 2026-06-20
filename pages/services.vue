<script setup lang="ts">
import ComingSoon from '~/components/sections/ComingSoon.vue'
import { useLocale } from '~/composables/useLocale'

const { t } = useLocale()
const title = computed(() => t('comingSoon.pages.services'))

useHead({ title: computed(() => `${title.value} — Fellas Barbers`) })
useSeoMeta({ robots: 'noindex, follow' })
</script>

<template>
  <ComingSoon :title="title" />
</template>
