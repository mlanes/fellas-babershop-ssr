<script setup lang="ts">
import FEyebrow from '~/components/ui/FEyebrow.vue'

/**
 * FSectionHeading - the eyebrow + heading + subtitle block shared by
 * every marketing section. Pass plain strings, or use the `heading` /
 * `subtitle` slots when inline markup (e.g. an accent span) is needed.
 */
withDefaults(
  defineProps<{
    /** Small uppercase accent label above the heading. */
    eyebrow?: string
    /** Main heading text (omit if using the #heading slot). */
    heading?: string
    /** Supporting line below the heading. */
    subtitle?: string
    /** Heading element level. */
    level?: 'h1' | 'h2' | 'h3'
    /** Alignment of the whole block. */
    align?: 'left' | 'center'
  }>(),
  { level: 'h2', align: 'center' }
)
</script>

<template>
  <div :class="['f-section-heading', `f-section-heading--${align}`]">
    <FEyebrow v-if="eyebrow || $slots.eyebrow" :align="align">
      <slot name="eyebrow">{{ eyebrow }}</slot>
    </FEyebrow>

    <component :is="level" class="f-section-heading__heading text-h2">
      <slot name="heading">{{ heading }}</slot>
    </component>

    <p v-if="subtitle || $slots.subtitle" class="f-section-heading__subtitle text-body-lg">
      <slot name="subtitle">{{ subtitle }}</slot>
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.f-section-heading {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  @include modifier('center') {
    align-items: center;
    text-align: center;
  }

  @include modifier('left') {
    align-items: flex-start;
    text-align: left;
  }

  @include element('heading') {
    margin: 0;
    color: var(--text-color-primary);
  }

  @include element('subtitle') {
    margin: 0;
    color: var(--text-color-secondary);
  }
}
</style>
