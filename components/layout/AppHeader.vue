<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import FLogo from '~/components/ui/FLogo.vue'
import FIcon from '~/components/ui/FIcon.vue'
import FButton from '~/components/ui/FButton.vue'
import FLanguageSelector from '~/components/ui/FLanguageSelector.vue'
import { navigationItems } from '~/data/navigation'
import { useUIStore } from '~/stores/ui'
import { useSmoothScroll } from '~/composables/useSmoothScroll'
import { useTheme } from '~/composables/useTheme'
import { useLocale } from '~/composables/useLocale'

/**
 * AppHeader - Main navigation header
 */
const uiStore = useUIStore()
const route = useRoute()
const { isMobileMenuOpen, activeSection } = storeToRefs(uiStore)
const { scrollTo } = useSmoothScroll()
const { isDark, toggleTheme } = useTheme()
const { t } = useLocale()

const headerRef = ref<HTMLElement | null>(null)
const isScrolled = ref(false)
const isHeaderVisible = ref(true)
let lastScrollY = 0
let isProgrammaticScroll = false

/**
 * Handle programmatic scroll event
 */
const handleProgrammaticScroll = () => {
  isProgrammaticScroll = true
  isHeaderVisible.value = false

  // Reset after scroll animation completes (smooth scroll takes ~500-1000ms)
  setTimeout(() => {
    isProgrammaticScroll = false
  }, 600)
}

/**
 * Handle scrolled to home event - show navbar
 */
const handleScrolledToHome = () => {
  // Show header immediately when reaching home
  isHeaderVisible.value = true
  isProgrammaticScroll = false
}

/**
 * Handle scroll to update header background and active section
 */
const handleScroll = () => {
  if (!import.meta.client) return

  const currentScrollY = window.scrollY

  isScrolled.value = currentScrollY > 20

  // Don't show/hide header during programmatic scroll
  if (!isProgrammaticScroll) {
    // Show/hide header based on scroll direction
    if (currentScrollY < lastScrollY) {
      // Scrolling up - show header
      isHeaderVisible.value = true
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down - hide header (only after scrolling past 100px)
      isHeaderVisible.value = false
    }
  }

  lastScrollY = currentScrollY

  // Simple scroll spy - check which section is in view
  const sections = ['home', 'about', 'services', 'gallery', 'barbershops']
  for (const sectionId of sections) {
    const element = document.getElementById(sectionId)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 100 && rect.bottom >= 100) {
        uiStore.setActiveSection(sectionId)
        break
      }
    }
  }
}

/**
 * Handle navigation click
 */
const handleNavClick = (href: string) => {
  uiStore.closeMobileMenu()

  // Nav targets are in-page anchors that only exist on the home page.
  // From any other route, navigate home with the hash so Nuxt scrolls
  // to the section on arrival instead of silently doing nothing.
  if (route.path !== '/') {
    navigateTo(`/${href}`)
    return
  }

  // Already home and clicking home at the top — nothing to do.
  if (import.meta.client && href === '#home' && window.scrollY < 100) {
    return
  }

  // Small delay to allow menu close animation, then scroll
  setTimeout(() => {
    scrollTo(href, 40)
  }, 100)
}

/**
 * Handle booking button click
 */
const handleBookingClick = () => {
  uiStore.closeMobileMenu()

  if (route.path !== '/') {
    navigateTo('/#barbershops')
    return
  }

  scrollTo('#barbershops')
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('programmatic-scroll-start', handleProgrammaticScroll)
    window.addEventListener('scrolled-to-home', handleScrolledToHome)
    handleScroll()
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('programmatic-scroll-start', handleProgrammaticScroll)
    window.removeEventListener('scrolled-to-home', handleScrolledToHome)
  }
})
</script>

<template>
  <header
    ref="headerRef"
    class="header"
    :class="{
      'header--scrolled': isScrolled,
      'header--menu-open': isMobileMenuOpen,
      'header--hidden': !isHeaderVisible,
    }"
  >
    <div class="header__container container">
      <!-- Logo and Navigation grouped together -->
      <div class="header__left">
        <a
          href="#home"
          class="header__logo"
          aria-label="Fellas Barbers Home"
          @click.prevent="handleNavClick('#home')"
        >
          <FLogo size="md" />
        </a>

        <!-- Desktop Navigation -->
        <nav class="header__nav">
          <a
            v-for="item in navigationItems"
            :key="item.href"
            :href="item.href"
            class="header__nav-link"
            :class="{ 'header__nav-link--active': activeSection === item.href.slice(1) }"
            :data-text="t(item.label)"
            @click.prevent="handleNavClick(item.href)"
          >
            {{ t(item.label) }}
          </a>
        </nav>
      </div>

      <!-- Booking Button (Desktop) -->
      <div class="header__actions">
        <FLanguageSelector />

        <button
          class="header__theme-toggle"
          :aria-label="isDark ? t('common.lightMode') : t('common.darkMode')"
          @click="toggleTheme"
        >
          <FIcon :name="isDark ? 'sun' : 'moon'" :size="20" />
        </button>

        <FButton variant="primary" size="md" @click="handleBookingClick">
          <FIcon name="calendar" :size="18" />
          {{ t('common.book') }}
        </FButton>
      </div>

      <!-- Mobile Actions (Language, Theme, Menu) -->
      <div class="header__mobile-actions-bar">
        <FLanguageSelector />

        <button
          class="header__theme-toggle header__theme-toggle--mobile-bar"
          :aria-label="isDark ? t('common.lightMode') : t('common.darkMode')"
          @click="toggleTheme"
        >
          <FIcon :name="isDark ? 'sun' : 'moon'" :size="20" />
        </button>

        <button
          class="header__mobile-toggle"
          :aria-label="isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')"
          @click="uiStore.toggleMobileMenu"
        >
          <FIcon :name="isMobileMenuOpen ? 'x' : 'menu'" :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="header__mobile-menu">
        <nav class="header__mobile-nav">
          <a
            v-for="item in navigationItems"
            :key="item.href"
            :href="item.href"
            class="header__mobile-nav-link"
            :class="{ 'header__mobile-nav-link--active': activeSection === item.href.slice(1) }"
            @click.prevent="handleNavClick(item.href)"
          >
            {{ t(item.label) }}
          </a>
        </nav>

        <div class="header__mobile-actions">
          <FButton variant="primary" size="md" full-width @click="handleBookingClick">
            <FIcon name="calendar" :size="18" />
            {{ t('common.book') }}
          </FButton>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: saturate(180%) blur(10px);
  backdrop-filter: saturate(180%) blur(10px);
  transition:
    transform 0.2s ease,
    background-color $transition-base,
    box-shadow $transition-base;
  // Force hardware acceleration for iOS
  transform: translateY(0) translateZ(0);
  -webkit-transform: translateY(0) translateZ(0);

  @supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
    background-color: color-mix(in srgb, var(--page-background) 30%, transparent);
  }

  @include modifier('scrolled') {
    background-color: rgba(0, 0, 0, 0.85);
    -webkit-backdrop-filter: saturate(180%) blur(10px);
    backdrop-filter: saturate(180%) blur(10px);
    box-shadow: 0 2px 10px var(--surface-shadow);

    @supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
      background-color: color-mix(in srgb, var(--header-background-scrolled) 85%, transparent);
    }
  }

  @include modifier('hidden') {
    transform: translateY(-100%) translateZ(0);
    -webkit-transform: translateY(-100%) translateZ(0);
  }

  @include modifier('menu-open') {
    background-color: var(--page-background);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  @include element('container') {
    @include container;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: $spacing-lg;
    padding-bottom: $spacing-lg;
  }

  @include element('left') {
    display: flex;
    align-items: center;
    gap: $spacing-2xl;
  }

  @include element('logo') {
    color: var(--text-color-primary);
    text-decoration: none;
    transition: opacity $transition-base;

    &:hover {
      opacity: 0.8;
    }
  }

  @include element('nav') {
    display: none;
    gap: $spacing-lg;

    @include desktop {
      display: flex;
      align-items: center;
    }
  }

  @include element('nav-link') {
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    position: relative;
    padding: 10px;
    color: var(--text-color-primary);
    transition: color 0.3s ease;

    // Gradient text overlay (starts hidden)
    &::before {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      padding: 10px;
      background: $gradient-brand-light-red;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      opacity: 0;
      transition: opacity 0.3s ease;

      @at-root [data-theme='dark'] & {
        background: $gradient-brand-dark-red;
        background-clip: text;
        -webkit-background-clip: text;
      }
    }

    // Vertical gradient line
    &::after {
      content: '';
      position: absolute;
      top: -100%;
      left: 50%;
      width: 2px;
      height: 0;
      background: $gradient-brand-light-red;
      transition: height 0.7s ease;

      @at-root [data-theme='dark'] & {
        background: $gradient-brand-dark-red;
      }
    }

    &:hover {
      color: $brand-red-dark;

      &::before {
        opacity: 0;
      }

      &::after {
        height: 40px;
      }
    }

    @include modifier('active') {
      color: $brand-red-dark;

      &::before {
        opacity: 0;
      }

      &::after {
        height: 40px;
      }
    }
  }

  @include element('actions') {
    display: none;

    @include desktop {
      display: flex;
      align-items: center;
      gap: $spacing-lg;
    }
  }

  @include element('mobile-actions-bar') {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    @include desktop {
      display: none;
    }
  }

  @include element('theme-toggle') {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    width: 40px;
    height: 40px;
    background: none;
    border: 1px solid var(--surface-border);
    border-radius: $radius-full;
    color: var(--text-color-primary);
    cursor: pointer;
    transition: all $transition-base;

    &:hover {
      background-color: color-mix(in srgb, var(--text-color-primary) 10%, transparent);
      border-color: $brand-red-dark;
      color: $brand-red-dark;
    }

    @include modifier('mobile') {
      width: 100%;
      height: auto;
      padding: $spacing-md $spacing-lg;
      border-radius: $radius-md;
      justify-content: flex-start;
      margin-bottom: $spacing-lg;

      span {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    @include modifier('mobile-bar') {
      // Keep the circular button style for mobile bar
    }
  }

  @include element('mobile-toggle') {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: none;
    border: none;
    color: var(--text-color-primary);
    cursor: pointer;
    transition: color $transition-base;

    &:hover {
      color: $brand-red-dark;
    }

    @include desktop {
      display: none;
    }
  }

  @include element('mobile-menu') {
    position: fixed;
    top: $header-height;
    left: 0;
    right: 0;
    z-index: 999;
    background-color: var(--page-background);
    padding: $spacing-2xl;
    transition: all $transition-base;
    height: calc(100vh - $header-height);
    overflow-y: auto;
    // Force hardware acceleration for iOS
    transform: translateZ(0);
    -webkit-transform: translateZ(0);

    @include desktop {
      display: none;
    }
  }

  @include element('mobile-nav') {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-3xl;
  }

  @include element('mobile-nav-link') {
    color: var(--text-color-primary);
    text-decoration: none;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: $spacing-sm 0;
    border-bottom: 1px solid var(--surface-border);
    transition: color $transition-base;

    &:hover {
      color: $brand-red-dark;
    }

    @include modifier('active') {
      color: $brand-red-dark;
    }
  }

  @include element('mobile-actions') {
    margin-top: $spacing-xl;
  }
}

// Mobile menu transitions
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    transform $transition-base,
    opacity $transition-base;
}

.mobile-menu-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.mobile-menu-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
