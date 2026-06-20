<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import FIcon from '~/components/ui/FIcon.vue'
import FSectionHeading from '~/components/ui/FSectionHeading.vue'
import FellasLogo from '~/assets/img/logo.svg'
import { useSmoothScroll } from '~/composables/useSmoothScroll'
import { useLocale } from '~/composables/useLocale'
import { useTranslatedServices } from '~/composables/useTranslatedServices'

/**
 * ExpandedServicesSection - Detailed service catalog with pricing
 */
const { scrollTo } = useSmoothScroll()
const { t } = useLocale()
const { services } = useTranslatedServices()
const sectionRef = ref<HTMLElement | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10
const slideDirection = ref<'left' | 'right'>('right')

// No service images assigned — all cards show the logo fallback
const getServiceImage = (_serviceId: string | undefined) => undefined

const totalPages = computed(() => Math.ceil(services.value.length / itemsPerPage))

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return services.value.slice(start, end)
})

const canGoPrev = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < totalPages.value)

const nextPage = () => {
  if (canGoNext.value) {
    slideDirection.value = 'right'
    currentPage.value++
    scrollTo('#expanded-services')
  }
}

const prevPage = () => {
  if (canGoPrev.value) {
    slideDirection.value = 'left'
    currentPage.value--
    scrollTo('#expanded-services')
  }
}

onMounted(() => {
  if (sectionRef.value) {
    sectionRef.value.classList.add('fade-in')
  }
})
</script>

<template>
  <section ref="sectionRef" id="expanded-services" class="expanded-services">
    <div class="expanded-services__container container">
      <div class="expanded-services__sidebar">
        <div class="expanded-services__sidebar-content">
          <FSectionHeading
            class="expanded-services__heading"
            align="left"
            :heading="t('services.allServices')"
            :subtitle="t('services.allServicesSubtitle')"
          />

          <div class="expanded-services__pagination expanded-services__pagination--desktop">
            <button
              class="expanded-services__pagination-btn"
              :class="{ 'expanded-services__pagination-btn--disabled': !canGoPrev }"
              :disabled="!canGoPrev"
              @click="prevPage"
            >
              <FIcon name="chevron-left" :size="24" />
            </button>

            <div class="expanded-services__pagination-info">
              <span class="expanded-services__pagination-current">{{ currentPage }}</span>
              <span class="expanded-services__pagination-separator">/</span>
              <span class="expanded-services__pagination-total">{{ totalPages }}</span>
            </div>

            <button
              class="expanded-services__pagination-btn"
              :class="{ 'expanded-services__pagination-btn--disabled': !canGoNext }"
              :disabled="!canGoNext"
              @click="nextPage"
            >
              <FIcon name="chevron-right" :size="24" />
            </button>
          </div>
        </div>
      </div>

      <div class="expanded-services__content">
        <transition :name="`slide-${slideDirection}`" mode="out-in">
          <div :key="currentPage" class="expanded-services__grid">
            <div
              v-for="(service, index) in paginatedServices"
              :key="index"
              class="expanded-services__card"
            >
              <div class="expanded-services__card-content">
                <div class="expanded-services__card-category">
                  <FIcon name="clock" :size="14" />
                  <span>{{ service.duration }}</span>
                </div>
                <h3 class="expanded-services__card-title">
                  {{ service.name }}
                </h3>
                <p class="expanded-services__card-description">
                  {{ service.description }}
                </p>
                <!-- <div class="expanded-services__card-price">
                  {{ service.price }}
                </div> -->
              </div>

              <div class="expanded-services__card-image">
                <FellasLogo class="expanded-services__card-logo" />
              </div>
            </div>
          </div>
        </transition>

        <div class="expanded-services__pagination expanded-services__pagination--mobile">
          <button
            class="expanded-services__pagination-btn"
            :class="{ 'expanded-services__pagination-btn--disabled': !canGoPrev }"
            :disabled="!canGoPrev"
            @click="prevPage"
          >
            <FIcon name="chevron-left" :size="24" />
          </button>

          <div class="expanded-services__pagination-info">
            <span class="expanded-services__pagination-current">{{ currentPage }}</span>
            <span class="expanded-services__pagination-separator">/</span>
            <span class="expanded-services__pagination-total">{{ totalPages }}</span>
          </div>

          <button
            class="expanded-services__pagination-btn"
            :class="{ 'expanded-services__pagination-btn--disabled': !canGoNext }"
            :disabled="!canGoNext"
            @click="nextPage"
          >
            <FIcon name="chevron-right" :size="24" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.expanded-services {
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
    display: flex;
    flex-direction: column;
    gap: $spacing-4xl;

    @include tablet {
      flex-direction: row;
      gap: $spacing-6xl;
      align-items: flex-start;
    }
  }

  @include element('sidebar') {
    @include tablet {
      flex: 0 1 35%;
      min-width: 0;
      position: sticky;
      top: calc($header-height + $spacing-4xl);
      align-self: flex-start;
    }
  }

  @include element('sidebar-content') {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    align-items: center;
    text-align: center;

    @include tablet {
      align-items: flex-start;
      text-align: left;
    }
  }

  @include element('heading') {
    margin-bottom: 0;
  }

  @include element('content') {
    flex: 1;
    min-width: 0;
    overflow: hidden;

    @include tablet {
      flex: 1 1 auto;
    }
  }

  @include element('grid') {
    display: flex;
    flex-direction: column;
  }

  @include element('pagination') {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-lg;
    margin-top: $spacing-2xl;

    @include modifier('desktop') {
      display: none;

      @include tablet {
        display: flex;
        justify-content: flex-start;
      }
    }

    @include modifier('mobile') {
      display: flex;
      margin-top: $spacing-2xl;

      @include tablet {
        display: none;
      }
    }
  }

  @include element('pagination-btn') {
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

    &:hover:not(:disabled) {
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

  @include element('pagination-info') {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-primary);
  }

  @include element('pagination-current') {
    color: $brand-red-dark;
  }

  @include element('pagination-separator') {
    color: $gray-5;
  }

  @include element('pagination-total') {
    color: $gray-5;
  }

  @include element('card') {
    background: transparent;
    border-bottom: 1px solid var(--surface-border);
    display: flex;
    flex-direction: row;
    gap: $spacing-lg;
    align-items: stretch;
    justify-content: space-between;
    transition: border-color $transition-base;
    overflow: visible;

    @include desktop {
      &:hover {
        .expanded-services__card-image {
          width: 180px;
          transform: translateX(0);
          opacity: 1;

          &::before {
            opacity: 1;
          }
        }

        .expanded-services__card-image-wrapper {
          img {
            transform: scale(1.08);
          }
        }

        .expanded-services__card-price {
          transform: translate3d(5px, 0, 0);
        }
      }
    }
  }

  @include element('card-content') {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-xl 0;
  }

  @include element('card-category') {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.5px;
    color: var(--text-color-secondary);
    margin: 0;

    :deep(svg) {
      flex-shrink: 0;
      color: $brand-red-dark;
    }
  }

  @include element('card-title') {
    color: var(--text-color-primary);
    font-weight: 700;
    font-size: 20px;
    line-height: 1.3;
    margin: 0;

    @include desktop {
      font-size: 22px;
    }
  }

  @include element('card-description') {
    color: var(--text-color-secondary);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }

  @include element('card-price') {
    font-size: 18px;
    font-weight: 700;
    color: $brand-red-dark;
    margin-top: $spacing-sm;
    transform: translate3d(0, 0, 0);
    opacity: 1;
    transition: transform 0.3s ease;

    @include desktop {
      font-size: 20px;
    }
  }

  @include element('card-image') {
    width: 180px;
    align-self: stretch;
    background: $gradient-brand-light-red;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    transform: translateX(0);
    opacity: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    @at-root [data-theme='dark'] & {
      background: $gradient-brand-dark-red;
    }

    @include tablet {
      width: 180px;
    }

    @include desktop {
      width: 180px;
      align-self: stretch;
      transition:
        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.4s ease;
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @include element('card-logo') {
    width: 60%;
    height: auto;
    color: var(--text-color-primary);
  }

  @include element('card-image-wrapper') {
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: var(--image-position, top);
      transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: scale(1);
    }
  }
}

// Services list transitions - slide right (going forward)
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

// Services list transitions - slide left (going backward)
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
