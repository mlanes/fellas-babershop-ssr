<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'

/**
 * FModal - reusable modal/dialog primitive. Handles the cross-cutting
 * machinery so consumers only have to pass content:
 * - Teleports to <body>
 * - Locks body scroll while open
 * - Closes on Escape and on backdrop click
 * - Moves focus to the close button on open, restores it on close
 * - Traps Tab focus on the close button so it can't escape the modal
 * - role/aria-modal/aria-label on the dialog
 */
const props = withDefaults(
  defineProps<{
    /** Controls visibility — typically bound with v-model:open. */
    open: boolean
    /** Accessible label announced when the dialog opens. */
    ariaLabel?: string
    /** Click on the dark backdrop closes the modal. */
    closeOnBackdrop?: boolean
  }>(),
  { ariaLabel: 'Dialog', closeOnBackdrop: true }
)

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLDivElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const close = () => emit('close')

const handleBackdropClick = (e: MouseEvent) => {
  if (props.closeOnBackdrop && e.target === dialogRef.value) close()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.open) return
  if (e.key === 'Escape') {
    close()
    return
  }
  // Focus trap: only the close button is reachable via Tab.
  if (e.key === 'Tab') {
    e.preventDefault()
    closeButtonRef.value?.focus()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!import.meta.client) return
    if (isOpen) {
      previouslyFocused = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
      await nextTick()
      closeButtonRef.value?.focus()
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  }
)

onUnmounted(() => {
  if (!import.meta.client) return
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="f-modal-fade">
      <div
        v-if="open"
        ref="dialogRef"
        class="f-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        @click="handleBackdropClick"
      >
        <div class="f-modal__content">
          <button
            ref="closeButtonRef"
            class="f-modal__close"
            type="button"
            aria-label="Close"
            @click="close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.f-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.95);
  padding: $spacing-md;

  @include tablet {
    padding: $spacing-xl;
  }

  @include desktop {
    padding: $spacing-2xl;
  }

  @include element('content') {
    position: relative;
    width: 100%;
    max-width: 1200px;
    max-height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;

    @include tablet {
      max-height: 90vh;
    }
  }

  @include element('close') {
    position: absolute;
    top: -$spacing-sm;
    right: -$spacing-sm;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #000;
    transition: all $transition-base;
    z-index: 10;

    @include tablet {
      width: 48px;
      height: 48px;
      top: -$spacing-md;
      right: -$spacing-md;
    }

    @include desktop {
      top: -$spacing-lg;
      right: -$spacing-lg;
    }

    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }

    &:focus-visible {
      outline: 2px solid var(--brand-color-primary, #e83752);
      outline-offset: 2px;
    }
  }
}

.f-modal-fade-enter-active,
.f-modal-fade-leave-active {
  transition: opacity $transition-base;

  .f-modal__content {
    transition: transform $transition-base;
  }
}

.f-modal-fade-enter-from,
.f-modal-fade-leave-to {
  opacity: 0;

  .f-modal__content {
    transform: scale(0.9);
  }
}

.f-modal-fade-enter-to,
.f-modal-fade-leave-from {
  opacity: 1;

  .f-modal__content {
    transform: scale(1);
  }
}
</style>
