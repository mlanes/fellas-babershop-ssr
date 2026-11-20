<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import FIcon from '~/components/ui/FIcon.vue'
import FSectionHeading from '~/components/ui/FSectionHeading.vue'
import QuoteIcon from '~/assets/icons/quote.svg'
import GoogleLogo from '~/assets/img/testimonials/google-logo.svg'
import { useTestimonials } from '~/composables/useTestimonials'
import { useLocale } from '~/composables/useLocale'
import { MAX_RATING, getInitials, renderStars } from '~/utils/testimonials'

/**
 * TestimonialsSection - Customer testimonials and reviews
 */
const sectionRef = ref<HTMLElement | null>(null)
const { t } = useLocale()
const { testimonials } = useTestimonials()
const selectedTestimonial = ref(0)
let autoRotateInterval: ReturnType<typeof setInterval> | null = null

/**
 * Start auto-rotation
 */
const startAutoRotate = () => {
  autoRotateInterval = setInterval(() => {
    selectedTestimonial.value = (selectedTestimonial.value + 1) % testimonials.length
  }, 5000)
}

onMounted(() => {
  if (sectionRef.value) {
    sectionRef.value.classList.add('fade-in')
  }

  // Auto-rotate testimonials every 5 seconds
  startAutoRotate()
})

onUnmounted(() => {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval)
  }
})

/**
 * Reset auto-rotation timer
 */
const resetAutoRotate = () => {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval)
  }
  startAutoRotate()
}

/**
 * Navigate to previous testimonial
 */
const previousTestimonial = () => {
  selectedTestimonial.value =
    selectedTestimonial.value === 0 ? testimonials.length - 1 : selectedTestimonial.value - 1
  resetAutoRotate()
}

/**
 * Navigate to next testimonial
 */
const nextTestimonial = () => {
  selectedTestimonial.value = (selectedTestimonial.value + 1) % testimonials.length
  resetAutoRotate()
}
</script>

<template>
  <section id="testimonials" ref="sectionRef" class="testimonials">
    <div class="testimonials__container container">
      <div class="testimonials__layout">
        <!-- Left Side: Title, Heading and Navigation -->
        <div class="testimonials__left">
          <FSectionHeading
            class="testimonials__heading"
            align="left"
            :eyebrow="t('testimonials.subtitle')"
            :heading="t('testimonials.heading')"
          />

          <div class="testimonials__google">
            <GoogleLogo class="testimonials__google-logo" />
            <span class="testimonials__reviews-count">{{ t('testimonials.reviewsCount') }}</span>
          </div>

          <div class="testimonials__navigation">
            <button
              class="testimonials__nav-button"
              :aria-label="t('a11y.previousTestimonial')"
              @click="previousTestimonial"
            >
              <FIcon name="chevron-left" :size="20" />
            </button>
            <button
              class="testimonials__nav-button testimonials__nav-button--active"
              :aria-label="t('a11y.nextTestimonial')"
              @click="nextTestimonial"
            >
              <FIcon name="chevron-right" :size="20" />
            </button>
          </div>
        </div>

        <!-- Right: Featured Testimonial Card -->
        <div class="testimonials__featured">
          <QuoteIcon class="testimonials__quote-icon" />

          <!-- All of them are laid out, one over the other, and one is shown.
               The card is then as tall as the longest and stays that tall. -->
          <div class="testimonials__stack">
            <div
              v-for="(testimonial, index) in testimonials"
              :key="index"
              class="testimonials__content"
              :class="{ 'testimonials__content--showing': index === selectedTestimonial }"
              :aria-hidden="index !== selectedTestimonial"
            >
              <!-- Customer info (mobile only) -->
              <div class="testimonials__featured-info">
                <div class="testimonials__featured-avatar">
                  {{ getInitials(testimonial.customerName) }}
                </div>
                <div class="testimonials__featured-details">
                  <span class="testimonials__featured-name">{{ testimonial.customerName }}</span>
                </div>
              </div>

              <p class="testimonials__comment">
                {{ testimonial.testimonialText }}
              </p>

              <div
                class="testimonials__rating"
                role="img"
                :aria-label="t('a11y.rating', { rating: testimonial.rating, max: MAX_RATING })"
              >
                <FIcon
                  v-for="(filled, i) in renderStars(testimonial.rating)"
                  :key="i"
                  name="star"
                  :size="24"
                  class="testimonials__star"
                  :class="{ 'testimonials__star--filled': filled }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.testimonials {
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

  @include element('layout') {
    display: grid;
    gap: $spacing-lg;
    align-items: flex-start;

    @include desktop {
      grid-template-columns: 1fr 1.5fr;
      gap: $spacing-5xl;
      align-items: center;
    }
  }

  @include element('left') {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  @include element('heading') {
    margin-bottom: $spacing-lg;
  }

  @include element('google') {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }

  @include element('google-logo') {
    width: 120px;
    height: auto;
  }

  @include element('reviews-count') {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-secondary);
  }

  @include element('navigation') {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-md;
  }

  @include element('nav-button') {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--surface-background);
    border: 1px solid var(--surface-border);
    border-radius: 50%;
    color: var(--text-color-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: $gradient-brand-light-red;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 50%;

      @at-root [data-theme='dark'] & {
        background: $gradient-brand-dark-red;
      }
    }

    :deep(svg) {
      position: relative;
      z-index: 1;
    }

    &:hover {
      border-color: transparent;
      color: $white;
      transform: scale(1.1);

      &::before {
        opacity: 1;
      }
    }

    @include modifier('disabled') {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  @include element('featured') {
    background: var(--surface-background);
    border-radius: $radius-lg;
    padding: $spacing-3xl;
    position: relative;

    @include tablet {
      padding: $spacing-4xl;
    }
  }

  // Every testimonial sits in the one cell, so the cell is as tall as the
  // tallest. Shown one at a time, a long review made the section 81px taller
  // than a short one on a phone, and the page below jumped every five seconds.
  @include element('stack') {
    display: grid;
  }

  @include element('content') {
    grid-area: 1 / 1;
    opacity: 0;
    transform: translateY(-10px);
    // Hidden from the eye, the keyboard and screen readers, but only once it
    // has faded.
    visibility: hidden;
    transition:
      opacity 0.5s ease,
      transform 0.5s ease,
      visibility 0s linear 0.5s;

    @include modifier('showing') {
      opacity: 1;
      transform: none;
      visibility: visible;
      // It waits for the one before it to go, as it always has.
      transition-delay: 0.5s;
    }

    // For a visitor who asked for less motion the fades are already cut to
    // nothing, but not these waits, which left the card empty for half a
    // second at every change.
    @media (prefers-reduced-motion: reduce) {
      &,
      &--showing {
        transition-delay: 0s;
      }
    }
  }

  @include element('featured-info') {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  @include element('featured-avatar') {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gradient-brand-light-red;
    color: $white;
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;

    @at-root [data-theme='dark'] & {
      background: $gradient-brand-dark-red;
    }
    letter-spacing: 0.5px;
    border: 2px solid $brand-red-dark;
  }

  @include element('featured-details') {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  @include element('featured-name') {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color-primary);
  }

  @include element('featured-date') {
    font-size: 13px;
    color: var(--text-color-tertiary);
  }

  @include element('quote-icon') {
    width: 48px;
    height: 48px;
    color: $brand-red-dark;
    margin-bottom: $spacing-xl;
  }

  @include element('comment') {
    color: var(--text-color-secondary);
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: $spacing-2xl;

    @include tablet {
      font-size: 16px;
      line-height: 2;
    }
  }

  @include element('rating') {
    display: flex;
    gap: 8px;
  }

  @include element('star') {
    color: var(--text-color-tertiary) !important;

    :deep(svg) {
      fill: none;
      stroke: currentColor;
    }

    @include modifier('filled') {
      color: #ffc107 !important;

      :deep(svg) {
        fill: currentColor;
        stroke: currentColor;
      }
    }
  }
}
</style>
