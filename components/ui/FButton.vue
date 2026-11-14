<script setup lang="ts">
/**
 * FButton - Reusable button component with multiple variants and sizes
 */
interface Props {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'gradient' | 'outline'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Disable button */
  disabled?: boolean
  /** Full width button */
  fullWidth?: boolean
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  fullWidth: false,
  type: 'button',
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'f-button',
      `f-button--${variant}`,
      `f-button--${size}`,
      {
        'f-button--full-width': fullWidth,
        'f-button--disabled': disabled,
      },
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.f-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  font-family: $font-primary;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  white-space: nowrap;
  user-select: none;

  &:focus-visible {
    @include focus-indicator;
  }

  // Variants
  @include modifier('primary') {
    position: relative;
    background: $gradient-brand-light-red;
    color: $white;
    overflow: hidden;
    z-index: 1;

    @at-root [data-theme='dark'] & {
      background: $gradient-brand-dark-red;
    }

    // Auto dark mode based on system preference
    @media (prefers-color-scheme: dark) {
      @at-root :root:not([data-theme='light']) & {
        background: $gradient-brand-dark-red;
      }
    }

    // Inverted gradient layer (hidden by default)
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #c41e3a 0%, #e63946 100%); // Inverted light gradient
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;

      @at-root [data-theme='dark'] & {
        background: linear-gradient(90deg, #8b0000 0%, #e63946 100%); // Inverted dark gradient
      }

      // Auto dark mode based on system preference
      @media (prefers-color-scheme: dark) {
        @at-root :root:not([data-theme='light']) & {
          background: linear-gradient(90deg, #8b0000 0%, #e63946 100%); // Inverted dark gradient
        }
      }
    }

    &:hover:not(:disabled) {
      box-shadow: $shadow-glow-red;
      transform: translateY(-2px);

      &::before {
        opacity: 1;
      }
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  @include modifier('secondary') {
    background-color: $gray-2;
    color: $white;

    &:hover:not(:disabled) {
      background-color: $gray-3;
      transform: translateY(-2px);
      box-shadow: $shadow-lg;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  @include modifier('gradient') {
    background: $gradient-brand-1;
    color: $white;

    &:hover:not(:disabled) {
      box-shadow: $shadow-glow-red;
      transform: translateY(-2px) scale(1.02);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(1);
    }
  }

  @include modifier('outline') {
    background-color: transparent;
    border: 2px solid var(--brand-color-accent);
    color: var(--brand-color-accent);

    &:hover:not(:disabled) {
      background-color: var(--brand-color-tertiary);
      border-color: var(--brand-color-tertiary);
      color: $white;
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  // Sizes
  @include modifier('sm') {
    padding: $spacing-sm $spacing-md;
    font-size: 14px;
    border-radius: $radius-sm;
  }

  @include modifier('md') {
    padding: $spacing-md $spacing-xl;
    font-size: 16px;
  }

  @include modifier('lg') {
    padding: $spacing-lg $spacing-2xl;
    font-size: 18px;
    border-radius: $radius-lg;
  }

  // States
  @include modifier('full-width') {
    width: 100%;
  }

  @include modifier('disabled') {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
