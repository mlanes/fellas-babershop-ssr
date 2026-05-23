<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FIcon from '~/components/ui/FIcon.vue'

/**
 * BeforeAfterSlider - Interactive before/after image comparison slider
 *
 * Features:
 * - Touch and mouse interaction
 * - Keyboard navigation (Arrow keys)
 * - Accessible with ARIA labels
 * - Responsive design
 * - Smooth dragging experience
 */

interface Props {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  initialPosition?: number
}

const props = withDefaults(defineProps<Props>(), {
  beforeLabel: 'Antes',
  afterLabel: 'Depois',
  initialPosition: 50,
})

const containerRef = ref<HTMLElement | null>(null)
const sliderPosition = ref(props.initialPosition)
const isDragging = ref(false)

const clipPathBefore = computed(() => `inset(0 ${100 - sliderPosition.value}% 0 0)`)
const sliderLeft = computed(() => `${sliderPosition.value}%`)

/**
 * Update slider position based on pointer/touch coordinates
 */
const updatePosition = (clientX: number) => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  sliderPosition.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

/**
 * Mouse event handlers
 */
const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  updatePosition(event.clientX)
  event.preventDefault()
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  updatePosition(event.clientX)
}

const handleMouseUp = () => {
  isDragging.value = false
}

/**
 * Touch event handlers
 */
const handleTouchStart = (event: TouchEvent) => {
  isDragging.value = true
  updatePosition(event.touches[0].clientX)
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value) return
  updatePosition(event.touches[0].clientX)
  event.preventDefault()
}

const handleTouchEnd = () => {
  isDragging.value = false
}

/**
 * Keyboard navigation
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    sliderPosition.value = Math.max(0, sliderPosition.value - 5)
    event.preventDefault()
  } else if (event.key === 'ArrowRight') {
    sliderPosition.value = Math.min(100, sliderPosition.value + 5)
    event.preventDefault()
  }
}

/**
 * Lifecycle hooks
 */
onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="before-after-slider"
    role="img"
    :aria-label="`Comparação de imagens: ${beforeLabel} e ${afterLabel}`"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <!-- After Image (full width) -->
    <div class="before-after-slider__image-container">
      <NuxtImg
        :src="afterImage"
        :alt="afterLabel"
        class="before-after-slider__image"
        width="800"
        height="1067"
        draggable="false"
        loading="lazy"
        decoding="async"
        sizes="sm:100vw md:50vw"
      />
      <div class="before-after-slider__label before-after-slider__label--after">
        {{ afterLabel }}
      </div>
    </div>

    <!-- Before Image (clipped) -->
    <div
      class="before-after-slider__image-container before-after-slider__image-container--before"
      :style="{ clipPath: clipPathBefore }"
    >
      <NuxtImg
        :src="beforeImage"
        :alt="beforeLabel"
        class="before-after-slider__image"
        width="800"
        height="1067"
        draggable="false"
        loading="lazy"
        decoding="async"
        sizes="sm:100vw md:50vw"
      />
      <div class="before-after-slider__label before-after-slider__label--before">
        {{ beforeLabel }}
      </div>
    </div>

    <!-- Slider Handle -->
    <div
      class="before-after-slider__handle"
      :style="{ left: sliderLeft }"
      @mousedown="handleMouseDown"
      @touchstart.passive="handleTouchStart"
      role="slider"
      :aria-valuenow="Math.round(sliderPosition)"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Controle de comparação de imagens"
    >
      <div class="before-after-slider__handle-line"></div>
      <div class="before-after-slider__handle-button">
        <FIcon
          name="chevron-left"
          :size="24"
          class="before-after-slider__handle-icon"
        />
        <FIcon
          name="chevron-right"
          :size="24"
          class="before-after-slider__handle-icon"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.before-after-slider {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: $radius-lg;
  cursor: ew-resize;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:focus {
    @include focus-indicator;
  }

  @include element('image-container') {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    @include modifier('before') {
      z-index: 2;
    }
  }

  @include element('image') {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    display: block;
  }

  @include element('label') {
    position: absolute;
    top: $spacing-lg;
    padding: $spacing-xs $spacing-md;
    background-color: rgba($gray-1, 0.8);
    color: $white;
    font-size: 14px;
    font-weight: 700;
    border-radius: $radius-md;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    // Force hardware acceleration for iOS
    transform: translateZ(0);
    -webkit-transform: translateZ(0);

    @include modifier('before') {
      left: $spacing-lg;
    }

    @include modifier('after') {
      right: $spacing-lg;
    }
  }

  @include element('handle') {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 8px;
    transform: translateX(-50%);
    z-index: 3;
    touch-action: none;
  }

  @include element('handle-line') {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 6px;
    background: $brand-red-dark;
    transform: translateX(-50%);
    box-shadow: 0 0 20px rgba($brand-red-dark, 0.9),
                0 0 40px rgba($brand-red-dark, 0.7),
                0 0 60px rgba($brand-red-dark, 0.5),
                0 0 80px rgba($brand-red-dark, 0.3);
  }

  @include element('handle-button') {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 64px;
    height: 64px;
    background: var(--page-background);
    border: 3px solid $brand-red-dark;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba($brand-red-dark, 0.2),
                0 4px 20px rgba($black, 0.3),
                0 8px 40px rgba($brand-red-dark, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ew-resize;
    transition: all $transition-base;

    &:hover {
      transform: translate(-50%, -50%) scale(1.15);
      box-shadow: 0 0 0 4px rgba($brand-red-dark, 0.3),
                  0 6px 25px rgba($black, 0.4),
                  0 12px 50px rgba($brand-red-dark, 0.6);
    }

    &:active {
      transform: translate(-50%, -50%) scale(1.0);
    }
  }

  @include element('handle-icon') {
    color: $brand-red-dark;
    filter: drop-shadow(0 2px 4px rgba($black, 0.2));

    &:first-child {
      margin-right: -4px;
    }

    &:last-child {
      margin-left: -4px;
    }
  }
}
</style>
