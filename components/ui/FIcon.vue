<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { featherIcons, type FeatherIconName } from './icons/feather-icons'
import type { IconName } from '~/types/icons'

/**
 * FIcon renders different SVG roots per icon name (quote/see-more/whatsapp
 * use custom inline SVGs, everything else falls back to a Feather icon via
 * v-html). Vue 3 can't auto-merge inherited class/style across multiple
 * root nodes, which produced an SSR-vs-CSR class mismatch. inheritAttrs is
 * off and we wire $attrs.class onto every root explicitly.
 */
defineOptions({ inheritAttrs: false })

interface Props {
  name: IconName
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
})

const attrs = useAttrs()
const rootClass = computed(() => ['f-icon', attrs.class as string | undefined])

// Custom icons that aren't in feather-icons
const customIcons = [
  'quote',
  'see-more',
  'checkmark',
  'close',
  'star-filled',
  'email',
  'location',
  'crown',
  'whatsapp',
]

const isCustomIcon = computed(() => customIcons.includes(props.name))

// Get feather icon SVG using tree-shakeable approach
const featherIconSvg = computed(() => {
  if (isCustomIcon.value) return ''

  try {
    const iconName = props.name as FeatherIconName
    const iconGenerator = featherIcons[iconName]
    if (!iconGenerator) {
      console.warn(`Icon "${props.name}" not found in feather-icons`)
      return ''
    }
    return iconGenerator({
      width: props.size,
      height: props.size,
      color: props.color,
      'stroke-width': 2,
    })
  } catch (error) {
    console.error(`Error loading icon "${props.name}":`, error)
    return ''
  }
})
</script>

<template>
  <!-- Custom Icons -->
  <svg
    v-if="name === 'quote'"
    :width="size"
    :height="size"
    :style="{ color }"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="rootClass"
    role="img"
    :aria-label="name"
  >
    <path
      d="M3 21C3 17.134 5.134 14 9 14V11C9 7.13401 6.86599 4 3 4V7C5.20914 7 7 8.79086 7 11V14C7 16.2091 5.20914 18 3 18V21ZM16 21C16 17.134 18.134 14 22 14V11C22 7.13401 19.866 4 16 4V7C18.2091 7 20 8.79086 20 11V14C20 16.2091 18.2091 18 16 18V21Z"
      fill="currentColor"
    />
  </svg>

  <svg
    v-else-if="name === 'see-more'"
    :width="props.size * 0.78"
    :height="props.size"
    :style="{ color }"
    viewBox="0 0 25 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="rootClass"
    role="img"
    :aria-label="name"
  >
    <path
      d="M11.1578 3.2C8.68594 3.2 7.42812 3.4704 6.27031 4.104C5.30472 4.62424 4.51586 5.43204 4.00781 6.4208C3.38906 7.6048 3.125 8.8944 3.125 11.424V20.5728C3.125 23.104 3.38906 24.392 4.00781 25.5776C4.53438 26.5856 5.28594 27.3552 6.27031 27.8944C7.42656 28.528 8.68594 28.7984 11.1578 28.7984H13.8422C16.3141 28.7984 17.5719 28.528 18.7297 27.8944C19.6953 27.3742 20.4841 26.5664 20.9922 25.5776C21.6109 24.3936 21.875 23.104 21.875 20.5728V11.424C21.875 8.8928 21.6109 7.6048 20.9922 6.4192C20.4841 5.43044 19.6953 4.62264 18.7297 4.1024C17.5734 3.4704 16.3141 3.2 13.8437 3.2H11.1563H11.1578ZM11.1578 0H13.8422C16.9891 0 18.6766 0.4448 20.2047 1.2816C21.7145 2.09998 22.9492 3.36431 23.7484 4.9104C24.5656 6.4752 25 8.2032 25 11.4256V20.5744C25 23.7968 24.5656 25.5248 23.7484 27.0896C22.9492 28.6357 21.7145 29.9 20.2047 30.7184C18.6766 31.5552 16.9891 32 13.8422 32H11.1563C8.00938 32 6.32187 31.5552 4.79375 30.7184C3.28389 29.9 2.0492 28.6357 1.25 27.0896C0.434375 25.5248 0 23.7968 0 20.5744V11.424C0 8.2016 0.434375 6.4736 1.25156 4.9088C2.05143 3.36307 3.28667 2.0993 4.79688 1.2816C6.32344 0.4448 8.01094 0 11.1578 0ZM10.9375 6.4H14.0625V14.4H10.9375V6.4Z"
      fill="url(#paint0_linear_see_more)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_see_more"
        x1="12.5"
        y1="0"
        x2="12.5"
        y2="32"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#D4203B" />
        <stop offset="1" stop-color="#E83752" stop-opacity="0" />
      </linearGradient>
    </defs>
  </svg>

  <svg
    v-else-if="name === 'whatsapp'"
    :width="size"
    :height="size"
    :style="{ color }"
    viewBox="0 0 30.667 30.667"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="rootClass"
    role="img"
    :aria-label="name"
  >
    <path
      d="M30.667,14.939c0,8.25-6.74,14.938-15.056,14.938c-2.639,0-5.118-0.675-7.276-1.857L0,30.667l2.717-8.017
		c-1.37-2.25-2.159-4.892-2.159-7.712C0.559,6.688,7.297,0,15.613,0C23.928,0.002,30.667,6.689,30.667,14.939z M15.61,2.382
		c-6.979,0-12.656,5.634-12.656,12.56c0,2.748,0.896,5.292,2.411,7.362l-1.58,4.663l4.862-1.545c2,1.312,4.393,2.076,6.963,2.076
		c6.979,0,12.658-5.633,12.658-12.559C28.27,8.016,22.59,2.382,15.61,2.382z M23.214,18.38c-0.094-0.151-0.34-0.243-0.708-0.427
		c-0.367-0.184-2.184-1.069-2.521-1.189c-0.34-0.123-0.586-0.185-0.832,0.182c-0.243,0.367-0.951,1.191-1.168,1.437
		c-0.215,0.245-0.43,0.276-0.799,0.095c-0.369-0.186-1.559-0.57-2.969-1.817c-1.097-0.972-1.838-2.169-2.052-2.536
		c-0.217-0.366-0.022-0.564,0.161-0.746c0.165-0.165,0.369-0.428,0.554-0.643c0.185-0.213,0.246-0.364,0.369-0.609
		c0.121-0.245,0.06-0.458-0.031-0.643c-0.092-0.184-0.829-1.984-1.138-2.717c-0.307-0.732-0.614-0.611-0.83-0.611
		c-0.215,0-0.461-0.03-0.707-0.03S9.897,8.215,9.56,8.582s-1.291,1.252-1.291,3.054c0,1.804,1.321,3.543,1.506,3.787
		c0.186,0.243,2.554,4.062,6.305,5.528c3.753,1.465,3.753,0.976,4.429,0.914c0.678-0.062,2.184-0.885,2.49-1.739
		C23.307,19.268,23.307,18.533,23.214,18.38z"
      fill="currentColor"
    />
  </svg>

  <!-- Feather Icons -->
  <span v-else :class="rootClass" role="img" :aria-label="name" v-html="featherIconSvg" />
</template>

<style scoped lang="scss">
.f-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;

  :deep(svg) {
    display: block;
  }
}
</style>
