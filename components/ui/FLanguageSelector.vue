<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import FIcon from '~/components/ui/FIcon.vue'
import { useLocale, type Locale } from '~/composables/useLocale'

const { locale, setLocale } = useLocale()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const optionRefs = ref<HTMLButtonElement[]>([])

const languages = [
  { code: 'pt' as Locale, label: 'Português', flag: '🇵🇹' },
  { code: 'en' as Locale, label: 'English', flag: '🇬🇧' },
  { code: 'es' as Locale, label: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Locale, label: 'Français', flag: '🇫🇷' },
]

const currentLanguage = computed(() => {
  return languages.find((lang) => lang.code === locale.value) || languages[0]
})

const getCurrentLanguageCode = computed(() => {
  const code = locale.value
  if (code === 'pt') return 'PT'
  if (code === 'es') return 'ES'
  if (code === 'fr') return 'FR'
  return code.toUpperCase()
})

const focusOption = (index: number) => {
  const target = optionRefs.value[index]
  if (target) target.focus()
}

const openDropdown = async () => {
  isOpen.value = true
  await nextTick()
  const currentIndex = languages.findIndex((lang) => lang.code === locale.value)
  focusOption(currentIndex >= 0 ? currentIndex : 0)
}

const closeDropdown = (returnFocus = true) => {
  isOpen.value = false
  if (returnFocus) buttonRef.value?.focus()
}

const toggleDropdown = () => {
  if (isOpen.value) closeDropdown()
  else openDropdown()
}

const selectLanguage = (code: Locale) => {
  setLocale(code)
  closeDropdown()
}

const handleButtonKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openDropdown()
  }
}

const handleOptionKeydown = (event: KeyboardEvent, index: number) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'ArrowDown':
      event.preventDefault()
      focusOption((index + 1) % languages.length)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusOption((index - 1 + languages.length) % languages.length)
      break
    case 'Home':
      event.preventDefault()
      focusOption(0)
      break
    case 'End':
      event.preventDefault()
      focusOption(languages.length - 1)
      break
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div ref="dropdownRef" class="language-selector">
    <button
      ref="buttonRef"
      class="language-selector__button"
      type="button"
      :title="currentLanguage.label"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggleDropdown"
      @keydown="handleButtonKeydown"
    >
      <span class="language-selector__flag" aria-hidden="true">{{ currentLanguage.flag }}</span>
      <span class="language-selector__code">{{ getCurrentLanguageCode }}</span>
      <FIcon
        name="chevron-down"
        :size="16"
        class="language-selector__icon"
        :class="{ 'language-selector__icon--open': isOpen }"
      />
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="language-selector__dropdown" role="listbox">
        <button
          v-for="(lang, index) in languages"
          :key="lang.code"
          :ref="
            (el) => {
              if (el) optionRefs[index] = el as HTMLButtonElement
            }
          "
          class="language-selector__option"
          :class="{ 'language-selector__option--active': lang.code === locale }"
          type="button"
          role="option"
          :aria-selected="lang.code === locale"
          @click="selectLanguage(lang.code)"
          @keydown="handleOptionKeydown($event, index)"
        >
          <span class="language-selector__option-flag" aria-hidden="true">{{ lang.flag }}</span>
          <span class="language-selector__option-label">{{ lang.label }}</span>
          <FIcon
            v-if="lang.code === locale"
            name="check"
            :size="16"
            class="language-selector__option-check"
            aria-hidden="true"
          />
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.language-selector {
  position: relative;

  @include element('button') {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: none;
    border: 1px solid var(--surface-border);
    border-radius: $radius-full;
    color: var(--text-color-primary);
    cursor: pointer;
    transition: all $transition-base;
    font-size: 14px;
    font-weight: 600;

    &:hover {
      background-color: color-mix(in srgb, var(--text-color-primary) 10%, transparent);
      border-color: $brand-red-dark;
    }
  }

  @include element('flag') {
    font-size: 16px;
    line-height: 1;
  }

  @include element('code') {
    letter-spacing: 0.5px;
  }

  @include element('icon') {
    transition: transform $transition-base;
    color: var(--text-color-secondary);

    @include modifier('open') {
      transform: rotate(180deg);
    }
  }

  @include element('dropdown') {
    position: absolute;
    top: calc(100% + $spacing-sm);
    right: 0;
    min-width: 160px;
    background: var(--surface-background);
    border: 1px solid var(--surface-border);
    border-radius: $radius-md;
    box-shadow: 0 4px 12px var(--surface-shadow);
    overflow: hidden;
    z-index: 100;
  }

  @include element('option') {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    width: 100%;
    padding: $spacing-md $spacing-lg;
    background: none;
    border: none;
    color: var(--text-color-primary);
    cursor: pointer;
    transition: all $transition-base;
    text-align: left;
    font-size: 14px;

    &:hover {
      background-color: color-mix(in srgb, var(--text-color-primary) 5%, transparent);
    }

    @include modifier('active') {
      background-color: color-mix(in srgb, $brand-red-dark 10%, transparent);
      color: $brand-red-dark;
    }
  }

  @include element('option-flag') {
    font-size: 18px;
    line-height: 1;
  }

  @include element('option-label') {
    flex: 1;
  }

  @include element('option-check') {
    color: $brand-red-dark;
  }
}

// Dropdown transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity $transition-fast,
    transform $transition-fast;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
