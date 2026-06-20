<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FLogo from '~/components/ui/FLogo.vue'
import FIcon from '~/components/ui/FIcon.vue'
import FButton from '~/components/ui/FButton.vue'
import { useSmoothScroll } from '~/composables/useSmoothScroll'
import { useLocale } from '~/composables/useLocale'

/**
 * HeroSection - Full-screen hero section with brand identity and scroll indicator
 */
const { scrollTo } = useSmoothScroll()
const { t } = useLocale()
const heroRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const mobileVideoRef = ref<HTMLVideoElement | null>(null)

const handleScrollClick = () => {
  scrollTo('#about')
}

const handleBookingClick = () => {
  scrollTo('#barbershops')
}

onMounted(() => {
  // Trigger fade-in animation
  if (heroRef.value) {
    heroRef.value.classList.add('fade-in')
  }

  // Start video from second 7 and ensure it plays (iOS Safari fix)
  if (videoRef.value) {
    videoRef.value.currentTime = 7

    // Reset to second 7 when video loops
    videoRef.value.addEventListener('timeupdate', () => {
      if (videoRef.value && videoRef.value.currentTime < 7) {
        videoRef.value.currentTime = 7
      }
    })

    videoRef.value.play().catch(() => {
      // Autoplay failed, video will show poster instead
    })
  }

  // Ensure mobile video loops and plays
  if (mobileVideoRef.value) {
    mobileVideoRef.value.loop = true
    mobileVideoRef.value.play().catch(() => {
      // Autoplay failed, video will show poster instead
    })
  }
})
</script>

<template>
  <section id="home" ref="heroRef" class="hero">
    <!-- Background Video - Desktop -->
    <video
      ref="videoRef"
      class="hero__video hero__video--desktop"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/images/hero/hero-desktop-poster.jpg"
      width="1920"
      height="804"
      disablepictureinpicture
      disableremoteplayback
      aria-hidden="true"
    >
      <source src="~/assets/videos/fellas-barbershop-header-video.webm" type="video/webm" />
      <source src="~/assets/videos/fellas-barbershop-header-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <!-- Background Video - Mobile -->
    <video
      ref="mobileVideoRef"
      class="hero__video hero__video--mobile"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/images/hero/hero-mobile-poster.jpg"
      width="608"
      height="1080"
      disablepictureinpicture
      disableremoteplayback
      aria-hidden="true"
    >
      <source src="~/assets/videos/fellas-barbershop-mobile-hero.webm" type="video/webm" />
      <source src="~/assets/videos/fellas-barbershop-mobile-hero.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <!-- Dark overlay for better text readability -->
    <div class="hero__overlay"></div>

    <div class="hero__container container">
      <div class="hero__content">
        <FLogo size="lg" class="hero__logo" />

        <h1 class="hero__title text-h1">
          {{ t('hero.title') }}
          <span class="hero__title hero__title--premium">{{ t('hero.premium') }}</span>
        </h1>

        <p class="hero__tagline text-h5">{{ t('hero.tagline') }}</p>

        <p class="hero__description text-body-lg">
          {{ t('hero.description') }}
        </p>

        <!-- Mobile/Tablet Book Button -->
        <FButton variant="primary" size="md" class="hero__book-btn" @click="handleBookingClick">
          <FIcon name="calendar" :size="18" />
          {{ t('common.book') }}
        </FButton>
      </div>

      <button class="hero__scroll-indicator" @click="handleScrollClick">
        <FIcon name="see-more" :size="28" />
        <span class="hero__scroll-text">{{ t('hero.seeMore') }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--page-background);
  color: var(--text-color-primary);
  overflow: hidden;
  transition:
    background-color $transition-base,
    color $transition-base;

  @include element('video') {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;

    @include modifier('desktop') {
      display: none;

      @include tablet {
        display: block;
      }
    }

    @include modifier('mobile') {
      display: block;

      @include tablet {
        display: none;
      }
    }
  }

  @include element('overlay') {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      var(--hero-overlay-top) 0%,
      var(--hero-overlay-bottom) 100%
    );
    z-index: 1;
    transition: background $transition-base;
  }

  @include element('container') {
    @include container;
    position: relative;
    z-index: 2;
    padding-top: $spacing-6xl;
    padding-bottom: $spacing-6xl;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  @include element('content') {
    max-width: 1000px;
    width: 100%;
    opacity: 0;
    animation: fade-in $transition-slow forwards;
    animation-delay: 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;

    @include tablet {
      gap: $spacing-lg;
    }
  }

  @include element('logo') {
    color: var(--text-color-primary);
    height: auto;

    :deep(.f-logo__svg) {
      width: 100px;
      height: auto;
    }
  }

  @include element('title') {
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.1em;
    background: $gradient-brand-light-red;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: slide-up $transition-base forwards;
    animation-delay: 0.4s;
    opacity: 0;

    @at-root [data-theme='dark'] & {
      background: $gradient-brand-dark-red;
      background-clip: text;
      -webkit-background-clip: text;
    }

    @include modifier('premium') {
      color: var(--text-color-primary);
      background: none;
      -webkit-text-fill-color: var(--text-color-primary);
      letter-spacing: 0.2em;
      transition:
        color $transition-base,
        background $transition-base,
        -webkit-text-fill-color $transition-base;
    }
  }

  @include element('tagline') {
    color: var(--text-color-primary);
    font-weight: 600;
    letter-spacing: 0.1em;
    opacity: 0;
    animation: slide-up $transition-base forwards;
    animation-delay: 0.6s;
    transition: color $transition-base;
  }

  @include element('description') {
    color: var(--text-color-secondary);
    max-width: 600px;
    opacity: 0;
    animation: slide-up $transition-base forwards;
    animation-delay: 0.8s;
    transition: color $transition-base;
  }

  @include element('book-btn') {
    margin-top: $spacing-md;
    opacity: 0;
    animation:
      slide-up $transition-base forwards,
      pulse-shadow 2s ease-in-out infinite;
    animation-delay: 1s, 1.5s;

    // Hide on desktop, show only on mobile and tablet
    display: flex;

    @include desktop {
      display: none;
    }
  }

  @include element('scroll-indicator') {
    position: absolute;
    bottom: $spacing-5xl;
    left: 50%;
    transform: translateX(-50%);
    background: none;
    border: none;
    color: $brand-red-dark;
    cursor: pointer;
    padding: $spacing-sm;
    border-radius: $radius-full;
    transition: all $transition-base;
    opacity: 0;
    animation:
      fade-in $transition-base forwards,
      pulse 2s ease-in-out infinite;
    animation-delay: 1s;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;

    // Hide on mobile, show on tablet and desktop
    display: none;

    @include tablet {
      display: flex;
      bottom: $spacing-5xl;
      padding: $spacing-md;
    }

    &:hover {
      transform: translateX(-50%) translateY(-8px);
    }

    &:focus-visible {
      @include focus-indicator;
    }
  }

  @include element('scroll-text') {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-color-primary);
    transition: color $transition-base;

    @include tablet {
      font-size: 1rem;
    }
  }
}

// Fade-in class for root element
.fade-in {
  opacity: 1;
}

// Pulse shadow animation for the book button
@keyframes pulse-shadow {
  0%,
  100% {
    box-shadow: 0 0 20px 5px rgba($brand-red-dark, 0.8);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px 15px rgba($brand-red-dark, 0.3);
    transform: scale(1.05);
  }
}
</style>
