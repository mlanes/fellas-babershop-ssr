<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FellasLogo from '~/assets/img/logo.svg'

/**
 * AppLoader - Full-screen loader with logo and progress bar
 * Shows during initial page load and hides when DOM is fully loaded
 */

const progress = ref(0)
const isLoading = ref(true)
const MIN_DISPLAY_TIME = 0 // No artificial delay; fade as soon as DOM is ready

let startTime = 0

// Simulate progress during load
const updateProgress = () => {
  return setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
      if (progress.value > 90) progress.value = 90
    }
  }, 100)
}

const hideLoader = () => {
  const elapsedTime = Date.now() - startTime
  const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime)

  setTimeout(() => {
    isLoading.value = false
  }, remainingTime + 300) // Add 300ms for smooth fade out
}

onMounted(() => {
  // Initialize start time on client only
  startTime = Date.now()

  // Remove inline loader when Vue takes over
  const inlineLoader = document.getElementById('__nuxt-loader')
  if (inlineLoader) {
    inlineLoader.classList.add('fade-out')
    setTimeout(() => inlineLoader.remove(), 300)
  }

  const interval = updateProgress()

  // Wait for DOM to be fully loaded
  if (document.readyState === 'complete') {
    // Already loaded
    progress.value = 100
    clearInterval(interval)
    hideLoader()
  } else {
    window.addEventListener('load', () => {
      progress.value = 100
      clearInterval(interval)
      hideLoader()
    })
  }
})
</script>

<template>
  <Transition name="loader-fade">
    <div v-if="isLoading" class="app-loader">
      <div class="app-loader__content">
        <FellasLogo class="app-loader__logo" />
        <div class="app-loader__progress-container">
          <div class="app-loader__progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.app-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--page-background);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('~/assets/img/bg-compostion.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.6;
    z-index: -1;
    animation: bg-pulse 3s ease-in-out infinite;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xl;
  }

  &__logo {
    width: 160px;
    height: auto;
    filter: drop-shadow(0px 0px 0px rgba(247, 247, 247, 0))
      drop-shadow(0px 0px 0px rgba(0, 0, 0, 0));

    // Target all paths in the logo
    :deep(path) {
      fill-opacity: 0;
      stroke: currentColor;
      stroke-width: 0;
      stroke-dasharray: 1 1000;
      stroke-dashoffset: 0;
      animation: logo-draw 3s ease 0.2s forwards;
    }
  }

  // Add glow effect to the SVG
  &__logo {
    animation: logo-glow 3.2s ease 0s forwards;
  }

  &__progress-container {
    width: 200px;
    height: 2px;
    background-color: rgba($gray-1, 0.2);
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__progress-bar {
    height: 100%;
    background: $gradient-brand-dark-red;
    border-radius: $radius-full;
    transition: width 0.3s ease-out;
  }
}

// Fade animations
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

// Logo drawing animation (inspired by Xbox loader)
@keyframes logo-draw {
  0% {
    fill-opacity: 0;
    stroke-dasharray: 1 1000;
    stroke-dashoffset: 0;
    stroke-width: 0;
  }
  30% {
    fill-opacity: 0;
    stroke-dasharray: 150 0;
    stroke-dashoffset: 0;
    stroke-width: 0.5;
  }
  60%,
  90% {
    fill-opacity: 1;
    stroke-dasharray: 150 0;
    stroke-dashoffset: 0;
    stroke-width: 0;
  }
  100% {
    fill-opacity: 1;
    stroke-dasharray: 150 0;
    stroke-dashoffset: 0;
    stroke-width: 0;
  }
}

// Glow effect animation
@keyframes logo-glow {
  0%,
  20% {
    filter: drop-shadow(0px 0px 0px rgba($brand-red-dark, 0))
      drop-shadow(0px 0px 0px rgba(0, 0, 0, 0));
  }
  40%,
  50% {
    filter: drop-shadow(0px 0px 50px rgba($brand-red-dark, 0.9))
      drop-shadow(0px 0px 30px rgba($brand-red-dark, 0.7))
      drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.95));
  }
  75% {
    filter: drop-shadow(0px 0px 0px rgba($brand-red-dark, 0))
      drop-shadow(0px 0px 0px rgba(0, 0, 0, 0));
  }
  100% {
    filter: drop-shadow(0px 0px 40px rgba($brand-red-dark, 0.7))
      drop-shadow(0px 0px 20px rgba($brand-red-dark, 0.5))
      drop-shadow(0px 4px 15px rgba(0, 0, 0, 0.5));
  }
}

// Background composition pulse animation
@keyframes bg-pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.02);
  }
}
</style>
