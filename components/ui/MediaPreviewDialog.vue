<script setup lang="ts">
import { ref, watch } from 'vue'
import FModal from '~/components/ui/FModal.vue'

interface Props {
  isOpen: boolean
  mediaType: 'image' | 'video'
  mediaSrc: string
  mediaAlt?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const videoRef = ref<HTMLVideoElement | null>(null)

// Autoplay the video when the modal opens, pause it on close.
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!import.meta.client) return
    if (props.mediaType !== 'video' || !videoRef.value) return
    if (isOpen) videoRef.value.play()
    else videoRef.value.pause()
  }
)
</script>

<template>
  <FModal :open="isOpen" aria-label="Media preview" @close="emit('close')">
    <div class="media-preview-dialog__media-wrapper">
      <video
        v-if="mediaType === 'video'"
        ref="videoRef"
        :src="mediaSrc"
        class="media-preview-dialog__media"
        controls
        loop
        playsinline
      />
      <NuxtImg
        v-else
        :src="mediaSrc"
        :alt="mediaAlt"
        class="media-preview-dialog__media"
        width="1200"
        height="900"
        decoding="async"
        sizes="100vw lg:80vw"
      />
    </div>
  </FModal>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.media-preview-dialog {
  @include element('media-wrapper') {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @include element('media') {
    max-width: 100%;
    max-height: 85vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

    @include tablet {
      max-height: 90vh;
      border-radius: 12px;
    }
  }
}
</style>
