import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import { ref } from 'vue'
import FModal from './FModal.vue'
import FButton from './FButton.vue'

const meta = {
  title: 'Components/FModal',
  component: FModal,
  tags: ['autodocs'],
  args: { open: false, ariaLabel: 'Demo modal', closeOnBackdrop: true },
  parameters: {
    docs: {
      description: {
        component:
          'Reusable modal/dialog. Handles Teleport, body scroll lock, Escape, ' +
          'backdrop click, and focus management. Pass any content as the default slot.',
      },
    },
  },
} satisfies Meta<typeof FModal>

export default meta
type Story = StoryObj<typeof meta>

/** Click the button to toggle the modal; Escape or the X closes it. */
export const Default: Story = {
  render: () => ({
    components: { FModal, FButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <FButton @click="open = true">Open modal</FButton>
        <FModal :open="open" aria-label="Demo modal" @close="open = false">
          <div style="background:#fff;color:#0A0909;padding:2rem;border-radius:12px;max-width:480px">
            <h2 style="margin-top:0">A reusable modal</h2>
            <p>Press Escape, click the X, or click the dark backdrop to close.</p>
          </div>
        </FModal>
      </div>`,
  }),
}

/** Backdrop clicks are ignored when closeOnBackdrop is false. */
export const NoBackdropClose: Story = {
  render: () => ({
    components: { FModal, FButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <FButton @click="open = true">Open (X only)</FButton>
        <FModal :open="open" :close-on-backdrop="false" aria-label="Demo" @close="open = false">
          <div style="background:#fff;color:#0A0909;padding:2rem;border-radius:12px;max-width:420px">
            <h2 style="margin-top:0">Backdrop disabled</h2>
            <p>You can only close this with the X button or Escape.</p>
          </div>
        </FModal>
      </div>`,
  }),
}
