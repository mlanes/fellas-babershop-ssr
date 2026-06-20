<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FIcon from '~/components/ui/FIcon.vue'
import FButton from '~/components/ui/FButton.vue'
import FSectionHeading from '~/components/ui/FSectionHeading.vue'
import { useSmoothScroll } from '~/composables/useSmoothScroll'
import { useLocale } from '~/composables/useLocale'
import { useTranslatedServices } from '~/composables/useTranslatedServices'

const serviceImg1 = '/images/services/fellas-barbers-haircut-service-01.jpeg'
const serviceImg2 = '/images/services/fellas-barbers-beard-trim-service-02.jpeg'
const serviceImg3 = '/images/services/fellas-barbers-hair-styling-service-03.jpeg'
const galleryImg = '/images/gallery/gallery-08.jpeg'
const serviceImg5 = '/images/services/fellas-barbers-fade-haircut-service-05.jpeg'
const serviceImg6 = '/images/services/fellas-barbers-premium-service-06.jpeg'

/**
 * ServicesSection - Popular services overview with images and call-to-action
 */
const { scrollTo } = useSmoothScroll()
const { t } = useLocale()
const { services } = useTranslatedServices()
const sectionRef = ref<HTMLElement | null>(null)

// Service images
const serviceImages = [serviceImg1, serviceImg2, serviceImg3, galleryImg, serviceImg5, serviceImg6]

const handleViewServices = () => {
  scrollTo('#expanded-services')
}

onMounted(() => {
  if (sectionRef.value) {
    sectionRef.value.classList.add('fade-in')
  }
})
</script>

<template>
  <section ref="sectionRef" id="services" class="services">
    <div class="services__container container">
      <div class="services__content">
        <div class="services__left">
          <FSectionHeading
            class="services__heading"
            align="left"
            :eyebrow="t('services.subtitle')"
            :heading="t('services.heading')"
          />

          <div class="services__list">
            <div
              v-for="(service, index) in services.slice(0, 6)"
              :key="index"
              class="services__item"
            >
              <div class="services__icon">
                <FIcon name="check" :size="18" />
              </div>
              <span class="services__item-title">{{ service.name }}</span>
            </div>
          </div>

          <FButton variant="primary" size="md" class="services__button" @click="handleViewServices">
            {{ t('services.viewPricing') }}
          </FButton>
        </div>

        <div class="services__images">
          <div class="services__image-row">
            <div
              class="services__image-container services__image-container--large services__image-container--1"
            >
              <NuxtImg
                :src="serviceImages[0]"
                alt="Fellas Barbers professional haircut service"
                class="services__image"
                width="800"
                height="480"
                loading="lazy"
                decoding="async"
                sizes="sm:50vw md:33vw lg:25vw"
              />
            </div>
            <div
              class="services__image-container services__image-container--small services__image-container--2"
            >
              <NuxtImg
                :src="serviceImages[1]"
                alt="Fellas Barbers beard trim and grooming service"
                class="services__image"
                width="800"
                height="480"
                loading="lazy"
                decoding="async"
                sizes="sm:50vw md:33vw lg:25vw"
              />
            </div>
          </div>
          <div class="services__image-row">
            <div
              class="services__image-container services__image-container--small services__image-container--3"
            >
              <NuxtImg
                :src="serviceImages[2]"
                alt="Fellas Barbers hair styling service"
                class="services__image"
                width="800"
                height="480"
                loading="lazy"
                decoding="async"
                sizes="sm:50vw md:33vw lg:25vw"
              />
            </div>
            <div
              class="services__image-container services__image-container--large services__image-container--4"
            >
              <NuxtImg
                :src="serviceImages[3]"
                alt="Fellas Barbers premium grooming service"
                class="services__image"
                width="800"
                height="480"
                loading="lazy"
                decoding="async"
                sizes="sm:50vw md:33vw lg:25vw"
              />
            </div>
          </div>
          <div class="services__image-row">
            <div
              class="services__image-container services__image-container--large services__image-container--5"
            >
              <NuxtImg
                :src="serviceImages[4]"
                alt="Fellas Barbers fade haircut service"
                class="services__image"
                width="800"
                height="480"
                loading="lazy"
                decoding="async"
                sizes="sm:50vw md:33vw lg:25vw"
              />
            </div>
            <div
              class="services__image-container services__image-container--small services__image-container--6"
            >
              <NuxtImg
                :src="serviceImages[5]"
                alt="Fellas Barbers premium barbershop service"
                class="services__image"
                width="800"
                height="480"
                loading="lazy"
                decoding="async"
                sizes="sm:50vw md:33vw lg:25vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.services {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: $spacing-4xl 0;
  opacity: 0;
  transition: opacity $transition-slow;

  &.fade-in {
    opacity: 1;
  }

  @include element('container') {
    @include container;
  }

  @include element('content') {
    display: grid;
    gap: $spacing-4xl;

    @include desktop {
      grid-template-columns: 0.8fr 1.2fr;
      gap: $spacing-5xl;
      // align-items: center;
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

  @include element('list') {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;

    @include tablet {
      gap: $spacing-xl;
    }
  }

  @include element('item') {
    display: flex;
    gap: $spacing-md;
    align-items: center;
    animation: slide-up $transition-base forwards;

    @for $i from 1 through 6 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
        opacity: 0;
      }
    }
  }

  @include element('icon') {
    color: $white !important;
    background: $gradient-brand-light-red;
    border-radius: 50%;
    padding: 2px;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid $brand-red-dark;

    @at-root [data-theme='dark'] & {
      background: $gradient-brand-dark-red;
    }

    :deep(svg) {
      color: $white;
      fill: none;
      stroke: $white;
    }
  }

  @include element('item-title') {
    color: var(--text-color-secondary);
    font-size: 15px;
    font-weight: 400;
    transition: color $transition-base;
  }

  @include element('button') {
    width: fit-content;
    min-width: auto;
  }

  @include element('images') {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  @include element('image-row') {
    display: flex;
    gap: $spacing-md;
    width: 100%;
  }

  @include element('image-placeholder') {
    aspect-ratio: 6 / 3;
    background: var(--surface-background);
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-secondary);
    overflow: hidden;
    transition:
      background $transition-base,
      color $transition-base;
    animation: float 8s ease-in-out infinite;

    &:hover {
      animation-play-state: paused;
    }

    @include modifier('large') {
      width: 60%;
    }

    @include modifier('small') {
      width: 37%;
    }

    @include modifier('1') {
      animation-delay: 0s;
    }

    @include modifier('2') {
      animation-delay: 1.2s;
    }

    @include modifier('3') {
      animation-delay: 2.8s;
    }

    @include modifier('4') {
      animation-delay: 4.5s;
    }

    @include modifier('5') {
      animation-delay: 1.8s;
    }

    @include modifier('6') {
      animation-delay: 3.5s;
    }
  }

  @include element('image-container') {
    aspect-ratio: 5 / 3;
    border-radius: $radius-md;
    overflow: hidden;
    position: relative;
    animation: float 8s ease-in-out infinite;

    &:hover {
      animation-play-state: paused;
    }

    @include modifier('large') {
      width: 60%;
    }

    @include modifier('small') {
      width: 37%;
    }

    @include modifier('1') {
      animation-delay: 0s;
    }

    @include modifier('2') {
      animation-delay: 1.2s;
    }

    @include modifier('3') {
      animation-delay: 2.8s;
    }

    @include modifier('4') {
      animation-delay: 4.5s;
    }

    @include modifier('5') {
      animation-delay: 1.8s;
    }

    @include modifier('6') {
      animation-delay: 3.5s;
    }
  }

  @include element('image') {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0px, 0px);
  }
  25% {
    transform: translate(5px, -10px);
  }
  50% {
    transform: translate(0px, -15px);
  }
  75% {
    transform: translate(-5px, -10px);
  }
}
</style>
