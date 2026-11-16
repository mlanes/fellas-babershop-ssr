<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BeforeAfterSlider from '~/components/ui/BeforeAfterSlider.vue'
import FSectionHeading from '~/components/ui/FSectionHeading.vue'
import { useLocale } from '~/composables/useLocale'

const beforeImg1 = '/images/before-after/fellas-barbers-haircut-after-1.jpg'
const afterImg1 = '/images/before-after/fellas-barbers-haircut-after-2.jpg'
const beforeImg3 = '/images/before-after/fellas-barbers-haircut-before-3.jpg'
const afterImg3 = '/images/before-after/fellas-barbers-haircut-after-3.jpg'

/**
 * BeforeAfterSection - Before and After image comparison section
 */
const sectionRef = ref<HTMLElement | null>(null)
const { t } = useLocale()

// Before and after images from Fellas Barbershop
const beforeAfterPairs = [
  {
    before: beforeImg1,
    after: afterImg1,
  },
  {
    before: beforeImg3,
    after: afterImg3,
  },
]

onMounted(() => {
  if (sectionRef.value) {
    sectionRef.value.classList.add('fade-in')
  }
})
</script>

<template>
  <section id="before-after" ref="sectionRef" class="before-after-section">
    <div class="before-after-section__container container">
      <FSectionHeading
        class="before-after-section__heading"
        :eyebrow="t('beforeAfter.label')"
        :subtitle="t('beforeAfter.subtitle')"
      >
        <template #heading>
          {{ t('beforeAfter.headingBefore') }}
          <span class="before-after-section__heading-accent">&amp;</span>
          {{ t('beforeAfter.headingAfter') }}
        </template>
      </FSectionHeading>

      <div class="before-after-section__grid">
        <div
          v-for="(pair, index) in beforeAfterPairs"
          :key="index"
          class="before-after-section__item"
          :class="{ 'before-after-section__item--hidden-mobile': index > 0 }"
        >
          <BeforeAfterSlider
            :before-image="pair.before"
            :after-image="pair.after"
            :before-label="t('beforeAfter.before')"
            :after-label="t('beforeAfter.after')"
            :comparison-label="
              t('a11y.comparison', {
                before: t('beforeAfter.before'),
                after: t('beforeAfter.after'),
              })
            "
            :handle-label="t('a11y.comparisonHandle')"
            :initial-position="50"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.before-after-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: $spacing-4xl 0;
  color: var(--text-color-primary);
  opacity: 0;
  transition: opacity $transition-slow;

  &.fade-in {
    opacity: 1;
  }

  @include element('container') {
    @include container;
  }

  @include element('heading') {
    margin-bottom: $spacing-4xl;

    @include tablet {
      margin-bottom: $spacing-5xl;
    }
  }

  @include element('heading-accent') {
    color: $brand-red-dark;
  }

  @include element('grid') {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-2xl;
    max-width: 800px;
    margin: 0 auto;
    justify-items: center;

    @include tablet {
      grid-template-columns: 1fr 1fr;
      gap: $spacing-xl;
      max-width: 100%;
    }

    @include desktop {
      gap: $spacing-2xl;
      width: 70%;
    }
  }

  @include element('item') {
    animation: scale-in $transition-base forwards;
    opacity: 0;
    animation-delay: 0.2s;
    width: 100%;

    @include modifier('hidden-mobile') {
      display: none;

      @include tablet {
        display: block;
      }
    }
  }
}
</style>
