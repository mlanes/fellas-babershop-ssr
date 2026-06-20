<script setup lang="ts">
import FLogo from '~/components/ui/FLogo.vue'
import { useLocale } from '~/composables/useLocale'

/**
 * ComingSoon - placeholder screen for routes that are not built yet.
 * Centered, branded, translated, and always offers a way back home.
 */
defineProps<{
  /** Already-translated page name shown as the heading. */
  title: string
}>()

const { t } = useLocale()
</script>

<template>
  <section class="coming-soon">
    <div class="coming-soon__inner">
      <FLogo size="lg" class="coming-soon__logo" />
      <p class="coming-soon__badge">{{ t('comingSoon.badge') }}</p>
      <h1 class="coming-soon__title">{{ title }}</h1>
      <p class="coming-soon__text">{{ t('comingSoon.description') }}</p>
      <NuxtLink to="/" class="coming-soon__back">{{ t('comingSoon.backHome') }}</NuxtLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.coming-soon {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4xl $spacing-lg;
  background: var(--page-background);
  color: var(--text-color-primary);

  @include element('inner') {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: $spacing-md;
    max-width: 520px;
  }

  @include element('logo') {
    color: var(--text-color-primary);
    margin-bottom: $spacing-md;
  }

  @include element('badge') {
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--brand-color-accent);
  }

  @include element('title') {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3.5rem;
    line-height: 1;
    letter-spacing: 0.04em;

    @include tablet {
      font-size: 4.5rem;
    }
  }

  @include element('text') {
    color: var(--text-color-secondary);
    font-size: 1.0625rem;
    line-height: 1.6;
  }

  @include element('back') {
    margin-top: $spacing-lg;
    display: inline-flex;
    align-items: center;
    padding: $spacing-md $spacing-2xl;
    background: var(--brand-color-accent);
    color: $white;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: $radius-full;
    transition:
      transform $transition-fast,
      opacity $transition-fast;

    &:hover {
      transform: translateY(-2px);
      opacity: 0.92;
    }

    &:focus-visible {
      @include focus-indicator;
    }
  }
}
</style>
