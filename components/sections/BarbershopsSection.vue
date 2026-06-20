<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FIcon from '~/components/ui/FIcon.vue'
import FSectionHeading from '~/components/ui/FSectionHeading.vue'
import { useBarbershops } from '~/composables/useBarbershops'

const { t } = useI18n()
const { barbershops } = useBarbershops()

const shopIds = computed(() => barbershops.value.map((s) => s.id))

const currentImageIndex = ref<Record<string, number>>(
  Object.fromEntries(shopIds.value.map((id) => [id, 0]))
)

const isTransitioning = ref<Record<string, boolean>>(
  Object.fromEntries(shopIds.value.map((id) => [id, false]))
)

const intervals = ref<Record<string, ReturnType<typeof setInterval> | null>>(
  Object.fromEntries(shopIds.value.map((id) => [id, null]))
)

const startAutoPlay = (shopId: string, totalImages: number) => {
  // Clear existing interval
  if (intervals.value[shopId]) {
    clearInterval(intervals.value[shopId]!)
  }

  // Start new interval
  intervals.value[shopId] = setInterval(() => {
    nextImage(shopId, totalImages)
  }, 5000) // Change image every 5 seconds
}

const resetAutoPlay = (shopId: string, totalImages: number) => {
  startAutoPlay(shopId, totalImages)
}

const nextImage = (shopId: string, totalImages: number) => {
  if (isTransitioning.value[shopId]) return

  isTransitioning.value[shopId] = true
  currentImageIndex.value[shopId] = (currentImageIndex.value[shopId] + 1) % totalImages

  setTimeout(() => {
    isTransitioning.value[shopId] = false
  }, 400)

  resetAutoPlay(shopId, totalImages)
}

const prevImage = (shopId: string, totalImages: number) => {
  if (isTransitioning.value[shopId]) return

  isTransitioning.value[shopId] = true
  currentImageIndex.value[shopId] =
    (currentImageIndex.value[shopId] - 1 + totalImages) % totalImages

  setTimeout(() => {
    isTransitioning.value[shopId] = false
  }, 400)

  resetAutoPlay(shopId, totalImages)
}

const goToImage = (shopId: string, index: number, totalImages: number) => {
  if (isTransitioning.value[shopId] || currentImageIndex.value[shopId] === index) return

  isTransitioning.value[shopId] = true
  currentImageIndex.value[shopId] = index

  setTimeout(() => {
    isTransitioning.value[shopId] = false
  }, 400)

  resetAutoPlay(shopId, totalImages)
}

// Start auto-play on mount
onMounted(() => {
  barbershops.value.forEach((shop) => {
    startAutoPlay(shop.id, shop.images.length)
  })
})

onUnmounted(() => {
  // Clean up intervals
  Object.values(intervals.value).forEach((interval) => {
    if (interval) clearInterval(interval)
  })
})
</script>

<template>
  <section id="barbershops" class="barbershops-section">
    <div class="container">
      <FSectionHeading
        class="barbershops-section__heading"
        :eyebrow="t('barbershops.label')"
        :heading="t('barbershops.title')"
        :subtitle="t('barbershops.subtitle')"
      />

      <!-- Barbershop Cards -->
      <div class="barbershops-section__grid">
        <article v-for="shop in barbershops" :key="shop.id" class="barbershop-card">
          <!-- Image Carousel -->
          <div class="barbershop-card__carousel">
            <div
              class="barbershop-card__images"
              :style="{ transform: `translate3d(-${currentImageIndex[shop.id] * 100}%, 0, 0)` }"
            >
              <NuxtImg
                v-for="(image, index) in shop.images"
                :key="index"
                :src="image"
                :alt="`${shop.name} - Interior ${index + 1}`"
                class="barbershop-card__image"
                width="1200"
                height="900"
                loading="lazy"
                decoding="async"
                sizes="sm:100vw md:50vw lg:33vw"
              />
            </div>

            <!-- Navigation Arrows -->
            <button
              class="barbershop-card__nav barbershop-card__nav--prev"
              @click="prevImage(shop.id, shop.images.length)"
              aria-label="Previous image"
            >
              <FIcon name="chevron-left" :size="20" />
            </button>
            <button
              class="barbershop-card__nav barbershop-card__nav--next"
              @click="nextImage(shop.id, shop.images.length)"
              aria-label="Next image"
            >
              <FIcon name="chevron-right" :size="20" />
            </button>

            <!-- Dots Indicator -->
            <div class="barbershop-card__dots" role="tablist" :aria-label="`${shop.name} photos`">
              <button
                v-for="(_, index) in shop.images"
                :key="index"
                class="barbershop-card__dot"
                :class="{ 'barbershop-card__dot--active': currentImageIndex[shop.id] === index }"
                role="tab"
                type="button"
                :aria-selected="currentImageIndex[shop.id] === index"
                :aria-label="`View photo ${index + 1} of ${shop.images.length} of ${shop.name}`"
                @click="goToImage(shop.id, index, shop.images.length)"
              ></button>
            </div>
          </div>

          <!-- Card Content -->
          <div class="barbershop-card__content">
            <h3 class="barbershop-card__name">{{ shop.name }}</h3>

            <!-- Address -->
            <div class="barbershop-card__info">
              <FIcon name="map-pin" :size="20" class="barbershop-card__icon" />
              <p class="barbershop-card__address">{{ shop.address }}</p>
            </div>

            <!-- Schedule -->
            <div class="barbershop-card__schedule">
              <FIcon name="calendar" :size="20" class="barbershop-card__icon" />
              <div class="barbershop-card__schedule-times">
                <div class="barbershop-card__schedule-item">
                  <span class="barbershop-card__schedule-day">{{
                    shop.scheduleWeekday.split(':')[0]
                  }}</span>
                  <span class="barbershop-card__schedule-time">{{
                    shop.scheduleWeekday.split(':').slice(1).join(':').trim()
                  }}</span>
                </div>
                <div class="barbershop-card__schedule-item">
                  <span class="barbershop-card__schedule-day">{{
                    shop.scheduleWeekend.split(':')[0]
                  }}</span>
                  <span class="barbershop-card__schedule-time">{{
                    shop.scheduleWeekend.split(':').slice(1).join(':').trim()
                  }}</span>
                </div>
                <div class="barbershop-card__schedule-item">
                  <span class="barbershop-card__schedule-day">{{
                    shop.scheduleSunday.split(':')[0]
                  }}</span>
                  <span class="barbershop-card__schedule-time">{{
                    shop.scheduleSunday.split(':').slice(1).join(':').trim()
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Contact Buttons -->
            <div
              v-if="shop.phone || shop.whatsapp || shop.instagram || shop.facebook"
              class="barbershop-card__contacts"
            >
              <a
                v-if="shop.phone"
                :href="`tel:${shop.phone}`"
                class="barbershop-card__contact-icon-button"
                :aria-label="`Call ${shop.phone}`"
              >
                <FIcon name="phone" :size="20" />
              </a>
              <a
                v-if="shop.whatsapp"
                :href="`https://wa.me/${shop.whatsapp.replace(/\s/g, '')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="barbershop-card__contact-icon-button barbershop-card__contact-icon-button--whatsapp"
                :aria-label="`WhatsApp ${shop.whatsapp}`"
              >
                <FIcon name="whatsapp" :size="20" />
              </a>
              <a
                v-if="shop.instagram"
                :href="shop.instagram"
                target="_blank"
                rel="noopener noreferrer"
                class="barbershop-card__contact-icon-button barbershop-card__contact-icon-button--instagram"
                :aria-label="`Instagram ${shop.name}`"
              >
                <FIcon name="instagram" :size="20" />
              </a>
              <a
                v-if="shop.facebook"
                :href="shop.facebook"
                target="_blank"
                rel="noopener noreferrer"
                class="barbershop-card__contact-icon-button barbershop-card__contact-icon-button--facebook"
                :aria-label="`Facebook ${shop.name}`"
              >
                <FIcon name="facebook" :size="20" />
              </a>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="barbershop-card__footer">
            <a
              :href="shop.mapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="barbershop-card__button barbershop-card__button--secondary"
            >
              <FIcon name="map-pin" :size="18" />
              <span>{{ t('barbershops.viewMap') }}</span>
            </a>
            <a
              :href="shop.bookingUrl"
              class="barbershop-card__button barbershop-card__button--primary"
            >
              <FIcon name="calendar" :size="18" />
              <span>{{ t('barbershops.bookNow') }}</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.barbershops-section {
  position: relative;
  padding: $spacing-6xl 0;
  background-color: var(--section-background);
  overflow: hidden;

  // Bottom blur (centered)
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba($brand-red-dark, 0.8) 0%, transparent 70%);
    filter: blur(200px);
    -webkit-filter: blur(200px);
    z-index: 0;
    pointer-events: none;
    transform: translate(-50%, 50%);
    animation: pulse-blur-bottom 6s ease-in-out infinite;
    animation-delay: 3s; // Offset from the shared blur

    @include tablet {
      width: 800px;
      height: 800px;
      filter: blur(250px);
      -webkit-filter: blur(250px);
    }
  }

  @keyframes pulse-blur-bottom {
    0%,
    100% {
      opacity: 0.8;
      transform: translate(-50%, 50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, 50%) scale(1.1);
    }
  }

  > .container {
    position: relative;
    z-index: 1;
  }

  &__heading {
    margin-bottom: $spacing-4xl;

    @include tablet {
      margin-bottom: $spacing-5xl;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;
    margin: 0 auto;
    width: 100%;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
      gap: 48px;
    }

    @include desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

.barbershop-card {
  background: var(--footer-background);
  border-radius: $radius-xl;
  overflow: hidden;
  transition: transform $transition-base;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-4px);
  }

  &__carousel {
    position: relative;
    width: 100%;
    height: 280px;
    overflow: hidden;
    background: $gray-1;
    border-radius: $radius-lg $radius-lg 0 0;
  }

  &__images {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba($black, 0.6);
    backdrop-filter: blur(4px);
    color: $white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-fast;
    z-index: 10;

    &:hover {
      background: rgba($brand-red-dark, 0.95);
      transform: translateY(-50%) scale(1.1);
    }

    &--prev {
      left: $spacing-sm;
    }

    &--next {
      right: $spacing-sm;
    }
  }

  &__dots {
    position: absolute;
    bottom: $spacing-md;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: $spacing-sm;
    z-index: 10;
  }

  &__dot {
    // 24x24 hit area (WCAG 2.1 AA target size). The visible dot is the
    // 12x12 background clipped to content-box; 6px padding gives the buffer.
    box-sizing: content-box;
    width: 12px;
    height: 12px;
    padding: 6px;
    border-radius: 50%;
    background: rgba($white, 0.5);
    background-clip: content-box;
    border: none;
    cursor: pointer;
    transition:
      background $transition-fast,
      transform $transition-fast;

    &:hover {
      background: rgba($white, 0.8);
      background-clip: content-box;
      transform: scale(1.2);
    }

    &--active {
      background: $brand-red-dark;
      background-clip: content-box;
      transform: scale(1.2);
    }
  }

  &__content {
    padding: $spacing-xl $spacing-xl $spacing-md;
  }

  &__name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--page-color);
    margin-bottom: $spacing-md;
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    &::before {
      content: '';
      width: 4px;
      height: 24px;
      background: $gradient-brand-dark-red;
      border-radius: 2px;
    }
  }

  &__info,
  &__schedule {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  &__icon {
    color: $brand-red-dark;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__address {
    color: var(--text-muted);
    line-height: 1.5;
    font-size: 0.875rem;
  }

  &__contacts {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: $spacing-lg;
  }

  &__schedule-times {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    flex: 1;
  }

  &__schedule-item {
    display: flex;
    justify-content: space-between;
    gap: $spacing-md;
    padding: $spacing-xs 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--surface-border);
    }
  }

  &__schedule-day {
    color: var(--text-muted);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  &__schedule-time {
    color: var(--page-color);
    font-size: 0.8125rem;
    font-weight: 700;
  }

  &__footer {
    display: flex;
    gap: $spacing-md;
    padding: $spacing-xl;
    border-top: 1px solid var(--border-color);
    background: var(--section-background);

    @media (max-width: $breakpoint-tablet) {
      flex-direction: column;
    }
  }

  &__contact-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    text-decoration: none;
    border: none;
    border-radius: 50%;
    background: $brand-red-dark;
    color: $white;
    transition: all $transition-base;

    &:hover {
      transform: translateY(-2px) scale(1.1);
      box-shadow: 0 4px 12px rgba($brand-red-dark, 0.3);
    }

    @include modifier('whatsapp') {
      background: #25d366;

      &:hover {
        box-shadow: 0 4px 12px rgba(#25d366, 0.3);
      }
    }

    @include modifier('instagram') {
      background: linear-gradient(
        45deg,
        #f09433 0%,
        #e6683c 25%,
        #dc2743 50%,
        #cc2366 75%,
        #bc1888 100%
      );

      &:hover {
        box-shadow: 0 4px 12px rgba(#dc2743, 0.4);
      }
    }

    @include modifier('facebook') {
      background: #1877f2;

      &:hover {
        box-shadow: 0 4px 12px rgba(#1877f2, 0.4);
      }
    }

    svg {
      flex-shrink: 0;
    }
  }

  &__button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-md;
    font-weight: 600;
    font-size: 0.875rem;
    text-decoration: none;
    transition: all $transition-base;
    cursor: pointer;

    &--primary {
      position: relative;
      background: $gradient-brand-light-red;
      color: $white;
      border: none;
      overflow: hidden;
      z-index: 1;

      @at-root [data-theme='dark'] & {
        background: $gradient-brand-dark-red;
      }

      // Inverted gradient layer (hidden by default)
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, #c41e3a 0%, #e63946 100%); // Inverted light gradient
        opacity: 0;
        transition: opacity $transition-base;
        z-index: -1;

        @at-root [data-theme='dark'] & {
          background: linear-gradient(90deg, #8b0000 0%, #e63946 100%); // Inverted dark gradient
        }
      }

      &:hover {
        box-shadow: $shadow-glow-red;
        transform: translateY(-2px);

        &::before {
          opacity: 1;
        }
      }

      &:active {
        transform: translateY(0);
      }
    }

    &--secondary {
      background: transparent;
      color: $brand-red-dark;
      border: 2px solid $brand-red-dark;

      &:hover {
        background: rgba($brand-red-dark, 0.1);
        transform: translateY(-2px);
      }
    }
  }
}
</style>
