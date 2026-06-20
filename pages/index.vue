<script setup lang="ts">
/**
 * Home Page - Main landing page with all sections
 */
import HeroSection from '~/components/sections/HeroSection.vue'
import AboutSection from '~/components/sections/AboutSection.vue'
import ServicesSection from '~/components/sections/ServicesSection.vue'
import ExpandedServicesSection from '~/components/sections/ExpandedServicesSection.vue'
import GalleryScrollSection from '~/components/sections/GalleryScrollSection.vue'
import BeforeAfterSection from '~/components/sections/BeforeAfterSection.vue'
import TestimonialsSection from '~/components/sections/TestimonialsSection.vue'
import BarbershopsSection from '~/components/sections/BarbershopsSection.vue'

useHead({
  title: 'Fellas Barbers - A Sua Barbearia de Confiança',
})
</script>

<template>
  <div class="home">
    <HeroSection />
    <div class="home__section-wrapper">
      <AboutSection />
    </div>
    <ServicesSection />
    <ExpandedServicesSection />
    <GalleryScrollSection />
    <BeforeAfterSection />
    <div class="home__testimonials-wrapper">
      <TestimonialsSection />
      <!-- Shared blur between testimonials and barbershops -->
      <div class="home__section-blur"></div>
      <BarbershopsSection />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.home {
  min-height: 100vh;
  overflow-x: clip;

  &__section-wrapper {
    overflow-x: clip;
  }

  &__testimonials-wrapper {
    position: relative;
    overflow-x: clip;
  }

  &__section-blur {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba($brand-red-dark, 0.8) 0%, transparent 70%);
    filter: blur(200px);
    -webkit-filter: blur(200px);
    z-index: 1;
    pointer-events: none;
    transform: translate(-50%, -50%);
    animation: pulse-blur-shared 6s ease-in-out infinite;

    @include tablet {
      width: 800px;
      height: 800px;
      filter: blur(250px);
      -webkit-filter: blur(250px);
    }
  }

  @keyframes pulse-blur-shared {
    0%,
    100% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
}
</style>
