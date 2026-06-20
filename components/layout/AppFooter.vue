<script setup lang="ts">
import { ref } from 'vue'
import FLogoFooter from '~/components/ui/FLogoFooter.vue'
import FIcon from '~/components/ui/FIcon.vue'
import { navigationItems } from '~/data/navigation'
import { useSmoothScroll } from '~/composables/useSmoothScroll'
import { useLocale } from '~/composables/useLocale'
import { useBarbershops } from '~/composables/useBarbershops'

/**
 * AppFooter - Main footer with contact information and links
 */
const { scrollTo } = useSmoothScroll()
const { t } = useLocale()
const { barbershops } = useBarbershops()
const currentYear = ref(new Date().getFullYear())

/**
 * Handle navigation click
 */
const handleNavClick = (href: string) => {
  scrollTo(href)
}

/**
 * Handle scroll to top
 */
const scrollToTop = () => {
  scrollTo('#home')
}
</script>

<template>
  <footer class="footer">
    <div class="footer__container container">
      <div class="footer__grid">
        <!-- Logo and Description -->
        <div class="footer__column">
          <FLogoFooter size="md" class="footer__logo" />
          <p class="footer__tagline text-body">
            {{ t('footer.tagline') }}
          </p>
          <p class="footer__description text-body-sm">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Links Úteis -->
        <div class="footer__column">
          <h3 class="footer__heading text-h6">{{ t('footer.usefulLinks') }}</h3>
          <nav class="footer__links">
            <a
              v-for="item in navigationItems"
              :key="item.href"
              :href="item.href"
              class="footer__link"
              @click.prevent="handleNavClick(item.href)"
            >
              {{ t(item.label) }}
            </a>
          </nav>
        </div>

        <!-- Barbershop Contacts -->
        <div v-for="shop in barbershops" :key="shop.id" class="footer__column">
          <h3 class="footer__heading text-h6">{{ shop.name }}</h3>
          <div class="footer__contacts">
            <a
              v-if="shop.phone"
              :href="`tel:${shop.phone.replace(/\s/g, '')}`"
              class="footer__contact"
            >
              <FIcon name="phone" :size="20" />
              <span>{{ shop.phone }}</span>
            </a>
            <a
              v-if="shop.whatsapp"
              :href="`https://wa.me/${shop.whatsapp.replace(/[\s+]/g, '')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="footer__contact"
            >
              <FIcon name="whatsapp" :size="20" />
              <span>{{ shop.whatsapp }}</span>
            </a>
            <a
              v-if="shop.instagram"
              :href="shop.instagram"
              target="_blank"
              rel="noopener noreferrer"
              class="footer__contact"
            >
              <FIcon name="instagram" :size="20" />
              <span>Instagram</span>
            </a>
            <a
              v-if="shop.facebook"
              :href="shop.facebook"
              target="_blank"
              rel="noopener noreferrer"
              class="footer__contact"
            >
              <FIcon name="facebook" :size="20" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer__bottom">
        <p class="footer__copyright text-body-sm">
          © {{ currentYear }} {{ t('footer.copyright') }}
        </p>

        <!-- Go to Top Button -->
        <button class="footer__go-to-top" aria-label="Go to top" @click="scrollToTop">
          <FIcon name="arrow-up" :size="24" />
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.footer {
  background-color: var(--footer-background);
  color: var(--text-color-primary);
  padding: $spacing-5xl 0 $spacing-2xl;
  transition:
    background-color $transition-base,
    color $transition-base;

  @include element('container') {
    @include container;
  }

  @include element('grid') {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-4xl;
    margin-bottom: $spacing-4xl;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-3xl;
    }

    @include desktop {
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: $spacing-3xl;
    }
  }

  @include element('column') {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  @include element('logo') {
    color: var(--text-color-primary);
    margin-bottom: $spacing-sm;
    transition: color $transition-base;

    // Make SVG adapt to theme
    :deep(path[fill='#F7F9FC']) {
      fill: var(--text-color-primary);
    }

    :deep(path[stroke='#F7F9FC']) {
      stroke: var(--text-color-primary);
    }

    :deep(path[fill='#121111']) {
      fill: var(--text-color-primary);
    }
  }

  @include element('tagline') {
    color: var(--brand-color-accent);
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: $spacing-sm;
  }

  @include element('description') {
    color: var(--text-color-secondary);
    line-height: 1.6;
    margin-bottom: $spacing-md;
    transition: color $transition-base;
  }

  @include element('go-to-top') {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: color-mix(in srgb, var(--text-color-primary) 10%, transparent);
    color: var(--text-color-primary);
    border: none;
    cursor: pointer;
    transition: all $transition-base;

    &:hover {
      background-color: $brand-red-dark;
      color: $white;
      transform: translateY(-4px);
    }
  }

  @include element('heading') {
    color: var(--text-color-primary);
    font-weight: 700;
    margin-bottom: $spacing-md;
    transition: color $transition-base;
  }

  @include element('links') {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  @include element('link') {
    color: var(--text-color-secondary);
    text-decoration: none;
    font-size: 14px;
    text-transform: uppercase;
    transition: color $transition-base;

    &:hover {
      color: $brand-red-dark;
    }
  }

  @include element('hours') {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  @include element('hours-item') {
    display: flex;
    justify-content: space-between;
    gap: $spacing-lg;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid var(--surface-border);
    transition: border-color $transition-base;
  }

  @include element('hours-day') {
    color: var(--text-color-secondary);
    font-size: 14px;
    transition: color $transition-base;
  }

  @include element('hours-time') {
    color: var(--text-color-primary);
    font-size: 14px;
    font-weight: 600;
    transition: color $transition-base;
  }

  @include element('contacts') {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  @include element('contact') {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    color: var(--text-color-secondary);
    text-decoration: none;
    font-size: 14px;
    line-height: 1.6;
    transition: color $transition-base;

    &:hover {
      color: $brand-red-dark;
    }

    svg {
      flex-shrink: 0;
      margin-top: 2px;
    }
  }

  @include element('bottom') {
    padding-top: $spacing-2xl;
    border-top: 1px solid var(--surface-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: border-color $transition-base;
  }

  @include element('copyright') {
    color: var(--text-color-tertiary);
    transition: color $transition-base;
  }
}
</style>
