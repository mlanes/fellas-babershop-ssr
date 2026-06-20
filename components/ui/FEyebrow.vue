<script setup lang="ts">
/**
 * FEyebrow - small uppercase accent label that sits above section
 * headings. Brand-red gradient text, theme-aware.
 */
withDefaults(
  defineProps<{
    /** Text alignment. */
    align?: 'left' | 'center'
    /** Render as a block (own line) or inline. */
    as?: 'p' | 'span'
  }>(),
  { align: 'center', as: 'p' }
)
</script>

<template>
  <component :is="as" :class="['f-eyebrow', `f-eyebrow--${align}`]">
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.f-eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  background: $gradient-brand-light-red;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @at-root [data-theme='dark'] & {
    background: $gradient-brand-dark-red;
    background-clip: text;
    -webkit-background-clip: text;
  }

  @include modifier('center') {
    text-align: center;
  }

  @include modifier('left') {
    text-align: left;
  }
}
</style>
