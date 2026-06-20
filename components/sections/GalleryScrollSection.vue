<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocale } from '~/composables/useLocale'
import FSectionHeading from '~/components/ui/FSectionHeading.vue'
import MediaPreviewDialog from '~/components/ui/MediaPreviewDialog.vue'

/**
 * GalleryScrollSection - Infinite scrolling gallery with 3 rows
 * Row 1: Scrolls left on page scroll
 * Row 2: Scrolls right on page scroll
 * Row 3: Scrolls left on page scroll
 */

const { t } = useLocale()

// Media preview state
const isPreviewOpen = ref(false)
const previewMediaType = ref<'image' | 'video'>('image')
const previewMediaSrc = ref('')
const previewMediaAlt = ref('')

const openPreview = (type: string, src: string, alt: string) => {
  previewMediaType.value = type as 'image' | 'video'
  previewMediaSrc.value = src
  previewMediaAlt.value = alt
  isPreviewOpen.value = true
}

const closePreview = () => {
  isPreviewOpen.value = false
}

type MediaItem = {
  type: 'image' | 'video'
  src: string
  alt: string
}

// Add new gallery images to public/images/gallery/ and append the filename here.
const galleryFilenames = [
  'gallery-01.jpeg',
  'gallery-02.jpeg',
  'gallery-03.jpeg',
  'gallery-04.jpeg',
  'gallery-05.jpeg',
  'gallery-06.jpeg',
  'gallery-07.jpeg',
  'gallery-08.jpeg',
  'gallery-09.jpeg',
  'gallery-10.jpeg',
  'gallery-11.jpeg',
  'gallery-12.jpeg',
  'gallery-13.jpeg',
  'gallery-14.jpeg',
  'gallery-15.jpeg',
  'gallery-16.jpeg',
  'gallery-17.jpeg',
  'gallery-22.jpeg',
  'gallery-28.jpeg',
  'gallery-29.jpeg',
  'gallery-30.jpeg',
  'gallery-31.jpeg',
  'gallery-32.jpeg',
  'gallery-33.jpeg',
  'gallery-34.jpeg',
  'gallery-35.jpeg',
  'gallery-36.jpeg',
  'gallery-37.jpeg',
  'gallery-38.jpeg',
  'gallery-39.jpeg',
  'gallery-40.jpeg',
  'gallery-41.jpeg',
  'gallery-42.jpeg',
  'gallery-43.jpeg',
  'gallery-44.jpeg',
  'gallery-45.jpeg',
  'gallery-46.jpeg',
  'gallery-47.jpeg',
  'gallery-48.jpeg',
  'gallery-49.jpeg',
]

const videoExtensions = /\.(mp4|webm)$/i
const galleryItems: MediaItem[] = galleryFilenames.map((filename) => {
  const isVideo = videoExtensions.test(filename)
  const match = filename.match(/gallery-(\d+)/)
  const number = match ? parseInt(match[1]) : 0
  return {
    type: isVideo ? 'video' : 'image',
    src: `/images/gallery/${filename}`,
    alt: `${isVideo ? 'Gallery video' : 'Gallery image'} ${number}`,
  }
})

// Distribute items across 3 rows - divide into thirds
const thirdIndex = Math.ceil(galleryItems.length / 3)
const row1Items = galleryItems.slice(0, thirdIndex)
const row2Items = galleryItems.slice(thirdIndex, thirdIndex * 2)
const row3Items = galleryItems.slice(thirdIndex * 2)

const row1Ref = ref<HTMLElement | null>(null)
const row2Ref = ref<HTMLElement | null>(null)
const row3Ref = ref<HTMLElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)

// Performance: use requestAnimationFrame for smooth updates
let ticking = false

const handleScroll = () => {
  if (!import.meta.client) return
  if (!sectionRef.value || !row1Ref.value || !row2Ref.value || !row3Ref.value) return

  const rect = sectionRef.value.getBoundingClientRect()
  const windowHeight = window.innerHeight

  // Calculate continuous progress
  let progress = 0

  if (rect.top <= 0 && rect.bottom >= windowHeight) {
    // Section is in viewport - calculate progress
    const totalDistance = rect.height - windowHeight
    const scrolled = -rect.top
    progress = scrolled / totalDistance
  } else if (rect.bottom < windowHeight) {
    // Section has passed - keep at final position
    progress = 1
  }

  // Get half-width (one set of items) for smooth looping
  const row1HalfWidth = row1Ref.value.scrollWidth / 2
  const row2HalfWidth = row2Ref.value.scrollWidth / 2
  const row3HalfWidth = row3Ref.value.scrollWidth / 2

  // Clamp progress to prevent going beyond the duplicated items
  // This ensures smooth scrolling without modulo jumps
  const clampedProgress = Math.max(0, Math.min(progress, 0.999))

  // Row 1: moves left - simple linear scroll through one set
  const scroll1 = clampedProgress * row1HalfWidth
  row1Ref.value.style.transform = `translate3d(-${scroll1}px, 0px, 0px)`

  // Row 2: moves right - starts at -halfWidth and moves toward 0
  const scroll2 = clampedProgress * row2HalfWidth
  row2Ref.value.style.transform = `translate3d(-${row2HalfWidth - scroll2}px, 0px, 0px)`

  // Row 3: moves left - same as row 1
  const scroll3 = clampedProgress * row3HalfWidth
  row3Ref.value.style.transform = `translate3d(-${scroll3}px, 0px, 0px)`
}

const onScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll()
      ticking = false
    })
    ticking = true
  }
}

// Pinned scroll-driven animation runs only on desktop. Mobile and tablet
// let the page scroll past while the rows drift via a CSS keyframe
// animation — no scroll hijack on touch devices.
const PIN_BREAKPOINT = '(min-width: 1024px)'
let mediaQuery: MediaQueryList | null = null

const attachScrollListener = () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  handleScroll()
}

const detachScrollListener = () => {
  window.removeEventListener('scroll', onScroll)
  // Reset any inline transform left from a previous run so the CSS
  // animation can take over cleanly when shrinking past the breakpoint.
  for (const row of [row1Ref, row2Ref, row3Ref]) {
    if (row.value) row.value.style.transform = ''
  }
}

const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
  if (event.matches) attachScrollListener()
  else detachScrollListener()
}

onMounted(() => {
  if (!import.meta.client) return
  mediaQuery = window.matchMedia(PIN_BREAKPOINT)
  handleMediaChange(mediaQuery)
  mediaQuery.addEventListener('change', handleMediaChange)
})

onUnmounted(() => {
  if (!import.meta.client) return
  detachScrollListener()
  mediaQuery?.removeEventListener('change', handleMediaChange)
  mediaQuery = null
})
</script>

<template>
  <section ref="sectionRef" id="gallery" class="gallery-scroll">
    <div class="gallery-scroll__header-wrapper">
      <div class="gallery-scroll__header-sticky">
        <div class="gallery-scroll__header">
          <div class="gallery-scroll__header-container container">
            <FSectionHeading
              :eyebrow="t('gallery.label')"
              :heading="t('gallery.title')"
              :subtitle="t('gallery.subtitle')"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="gallery-scroll__pin-spacer">
      <div class="gallery-scroll__sticky">
        <div class="gallery-scroll__row-container">
          <!-- Row 1: Scrolls left (duplicated for infinite scroll) -->
          <div ref="row1Ref" class="gallery-scroll__row gallery-scroll__row--left">
            <div
              v-for="(item, index) in [...row1Items, ...row1Items]"
              :key="`row1-${index}`"
              class="gallery-scroll__item"
              @click="openPreview(item.type, item.src, item.alt)"
            >
              <video
                v-if="item.type === 'video'"
                :src="item.src"
                class="gallery-scroll__media"
                muted
                loop
                playsinline
                @mouseenter="(e) => (e.target as HTMLVideoElement).play()"
                @mouseleave="(e) => (e.target as HTMLVideoElement).pause()"
              />
              <NuxtImg
                v-else
                :src="item.src"
                :alt="item.alt"
                class="gallery-scroll__media"
                width="400"
                height="711"
                loading="lazy"
                decoding="async"
                sizes="200px md:300px lg:400px"
              />
            </div>
          </div>

          <!-- Row 2: Scrolls right (duplicated for infinite scroll) -->
          <div ref="row2Ref" class="gallery-scroll__row gallery-scroll__row--right">
            <div
              v-for="(item, index) in [...row2Items, ...row2Items]"
              :key="`row2-${index}`"
              class="gallery-scroll__item"
              @click="openPreview(item.type, item.src, item.alt)"
            >
              <video
                v-if="item.type === 'video'"
                :src="item.src"
                class="gallery-scroll__media"
                muted
                loop
                playsinline
                @mouseenter="(e) => (e.target as HTMLVideoElement).play()"
                @mouseleave="(e) => (e.target as HTMLVideoElement).pause()"
              />
              <NuxtImg
                v-else
                :src="item.src"
                :alt="item.alt"
                class="gallery-scroll__media"
                width="400"
                height="711"
                loading="lazy"
                decoding="async"
                sizes="200px md:300px lg:400px"
              />
            </div>
          </div>

          <!-- Row 3: Scrolls left (duplicated for infinite scroll) -->
          <div ref="row3Ref" class="gallery-scroll__row gallery-scroll__row--left">
            <div
              v-for="(item, index) in [...row3Items, ...row3Items]"
              :key="`row3-${index}`"
              class="gallery-scroll__item"
              @click="openPreview(item.type, item.src, item.alt)"
            >
              <video
                v-if="item.type === 'video'"
                :src="item.src"
                class="gallery-scroll__media"
                muted
                loop
                playsinline
                @mouseenter="(e) => (e.target as HTMLVideoElement).play()"
                @mouseleave="(e) => (e.target as HTMLVideoElement).pause()"
              />
              <NuxtImg
                v-else
                :src="item.src"
                :alt="item.alt"
                class="gallery-scroll__media"
                width="400"
                height="711"
                loading="lazy"
                decoding="async"
                sizes="200px md:300px lg:400px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Preview Dialog -->
    <MediaPreviewDialog
      :is-open="isPreviewOpen"
      :media-type="previewMediaType"
      :media-src="previewMediaSrc"
      :media-alt="previewMediaAlt"
      @close="closePreview"
    />
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.gallery-scroll {
  width: 100%;
  position: relative;
  padding: $spacing-4xl 0;

  @include element('header') {
    // No margin needed as spacing is handled by sticky wrapper
  }

  @include element('header-container') {
    @include container;
    text-align: center;
  }

  @include element('pin-spacer') {
    // Mobile + tablet: natural flow, no scroll hijack. Desktop regains
    // the tall spacer that the pinned scrollytelling animation needs.
    position: relative;

    @include desktop {
      height: 250vh;
    }
  }

  @include element('header-wrapper') {
    position: relative;
  }

  @include element('header-sticky') {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--background-primary);
  }

  @include element('sticky') {
    // Mobile + tablet: behaves as a normal block, rows drift via CSS
    // animation; only desktop pins to viewport for the scrollytelling.
    position: static;
    width: 100%;
    padding: $spacing-3xl 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    @include desktop {
      position: sticky;
      top: 0;
      height: 100vh;
      padding: 0;
    }

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 500px;
      height: 500px;
      background: radial-gradient(
        circle,
        rgba($brand-red-dark, 1) 0%,
        rgba($brand-red-dark, 0.8) 30%,
        transparent 70%
      );
      -webkit-filter: blur(80px);
      filter: blur(80px);
      z-index: -1;
      // translateZ(0) forces hardware acceleration for iOS
      transform: translate(-50%, -50%) translateZ(0);
      pointer-events: none;
      opacity: 0.8;
      animation: pulse-glow 3s ease-in-out infinite;
    }
  }

  @include element('row-container') {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    width: 100%;
    justify-content: center;
  }

  @include element('row') {
    display: flex;
    gap: $spacing-lg;
    will-change: transform;
    align-items: baseline;

    // Mobile + tablet: continuous ambient drift via CSS keyframes. The
    // rows contain a duplicated set of items, so translating by -50%
    // loops seamlessly. Desktop turns the keyframe off and lets the JS
    // scroll handler drive the transform.
    @include modifier('left') {
      animation: gallery-drift-left 45s linear infinite;

      @include desktop {
        animation: none;
        transform: translate3d(0, 0, 0);
      }
    }

    @include modifier('right') {
      animation: gallery-drift-right 45s linear infinite;

      @include desktop {
        animation: none;
        transform: translate3d(0, 0, 0);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    @include element('row') {
      animation: none !important;
    }
  }

  @include element('item') {
    flex-shrink: 0;
    width: 150px;
    height: 150px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    background: var(--surface-border);
    cursor: pointer;
    transition: transform $transition-base;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.98);
    }

    @include tablet {
      width: 200px;
      height: 200px;
    }

    @include desktop {
      width: 240px;
      height: 240px;
    }
  }

  @include element('media') {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) translateZ(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) translateZ(0) scale(1.15);
  }
}

@keyframes gallery-drift-left {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-50%, 0, 0);
  }
}

@keyframes gallery-drift-right {
  from {
    transform: translate3d(-50%, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}
</style>
